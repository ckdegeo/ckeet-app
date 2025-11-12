import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password,
      subdomain // Novo: subdomain da loja
    } = await request.json();

    console.log('🔍 Login attempt:', { email, subdomain });

    // Validar dados de entrada
    if (!email || !password || !subdomain) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, subdomain: !!subdomain });
      return NextResponse.json(
        { error: 'Email, senha e subdomain são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar seller pelo subdomain
    console.log('🔍 Searching seller for subdomain:', subdomain);
    const seller = await AuthService.getSellerBySubdomain(subdomain);
    if (!seller) {
      console.log('❌ Seller not found for subdomain:', subdomain);
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }
    console.log('✅ Seller found:', seller.id);
    
    const supabase = createServerSupabaseClient();

    // Fazer login no Supabase PRIMEIRO (ordem original)
    // O mesmo email pode ser seller em uma conta e customer em múltiplas lojas
    console.log('🔍 Attempting Supabase login for:', email);
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Se o erro for "Email not confirmed", confirmar automaticamente e tentar novamente
    if (authError && (authError.message.includes('Email not confirmed') || 
                      authError.message.includes('email_not_confirmed'))) {
      console.log('⚠️ Email não confirmado detectado. Confirmando automaticamente...');
      
      try {
        // Buscar o usuário pelo email usando a API Admin
        // Usar paginação para limitar a busca (máximo 1000 usuários por página)
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000
        });
        
        if (!listError && usersData && usersData.users) {
          const user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
          
          if (user) {
            // Confirmar o email automaticamente usando a API Admin
            const { error: confirmError } = await supabase.auth.admin.updateUserById(
              user.id,
              { email_confirm: true }
            );
            
            if (!confirmError) {
              console.log('✅ Email confirmado automaticamente. Tentando login novamente...');
              // Tentar fazer login novamente após confirmar o email
              const retryResult = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              
              if (!retryResult.error && retryResult.data) {
                authData = retryResult.data;
                authError = null;
                console.log('✅ Login bem-sucedido após confirmação automática de email');
              } else if (retryResult.error) {
                authError = retryResult.error;
              }
            } else {
              console.error('❌ Erro ao confirmar email automaticamente:', confirmError);
            }
          } else {
            console.warn('⚠️ Usuário não encontrado na lista de usuários do Supabase');
          }
        } else if (listError) {
          console.error('❌ Erro ao listar usuários:', listError);
        }
      } catch (error) {
        console.error('❌ Erro ao processar confirmação automática de email:', error);
        // Continuar com o erro original se a confirmação automática falhar
      }
    }

    if (authError) {
      console.log('❌ Supabase auth error:', authError.message, authError.status);
      
      // Mensagens de erro mais específicas baseadas no tipo de erro
      let errorMessage = 'Credenciais inválidas';
      
      if (authError.message.includes('Invalid login credentials') || 
          authError.message.includes('invalid_credentials') ||
          authError.message.includes('Invalid email or password')) {
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
      } else if (authError.message.includes('User not found') || 
                 authError.message.includes('user_not_found')) {
        errorMessage = 'Conta não encontrada. Faça o cadastro primeiro.';
      } else {
        // Para outros erros, usar a mensagem do Supabase ou genérica
        errorMessage = authError.message || 'Erro ao fazer login. Tente novamente.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }
    console.log('✅ Supabase login successful');

    // Verificar se authData e user existem
    if (!authData || !authData.user) {
      console.log('❌ Auth data ou user não encontrado após login');
      return NextResponse.json(
        { error: 'Erro ao fazer login. Tente novamente.' },
        { status: 500 }
      );
    }

    // Verificar se é um customer ou se pode se tornar um
    const userType = authData.user.user_metadata?.user_type;
    console.log('🔍 User type:', userType);
    
    // Verificar se o customer existe no banco para ESTA loja específica
    // O mesmo email pode ser customer em múltiplas lojas diferentes
    console.log('🔍 Checking if customer exists in database for this seller:', { email, sellerId: seller.id });
    const customer = await AuthService.getCustomerByEmailAndSeller(email, seller.id);
    
    if (!customer) {
      console.log('❌ Customer not found for this seller');
      return NextResponse.json(
        { error: 'Cliente não encontrado nesta loja. Faça o cadastro primeiro.' },
        { status: 404 }
      );
    }
    console.log('✅ Customer found in database:', customer.id);
    
    // Se não é customer, mas existe customer no banco, atualizar user_type
    if (userType !== 'customer') {
      console.log('🔍 User is not a customer type, but customer exists in DB. Updating user_type:', userType);
      
      // Atualizar user_type nos metadados para customer
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...authData.user.user_metadata,
          user_type: 'customer'
        }
      });
      
      if (updateError) {
        console.error('❌ Error updating user_type:', updateError);
        // Continuar mesmo com erro, pois o customer existe no banco
      } else {
        console.log('✅ User type updated to customer');
      }
    }

    // Verificar se o customer está banido
    if (customer.status === 'BANNED') {
      console.log('❌ Customer is banned:', customer.id);
      return NextResponse.json(
        { error: 'Sua conta foi suspensa. Entre em contato com o suporte da loja.' },
        { status: 403 }
      );
    }

    // Atualizar metadados do usuário com customer_id e seller_id
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        ...authData.user.user_metadata,
        user_type: 'customer',
        customer_id: customer.id,
        seller_id: seller.id
      }
    });

    if (updateError) {
      console.error('❌ Erro ao atualizar metadados do usuário:', updateError);
      // Continuar mesmo com erro, pois o customer existe
    } else {
      console.log('✅ Metadados do usuário atualizados com customer_id:', customer.id);
    }

    // Sincronizar usuário com Prisma
    await AuthService.syncUser(authData.user);

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        name: customer.name || authData.user.user_metadata?.name || 'Cliente',
        user_type: 'customer',
        customer_id: customer.id,
        seller_id: seller.id,
      },
      tokens: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
