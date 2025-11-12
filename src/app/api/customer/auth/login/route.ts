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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('❌ Supabase auth error:', authError.message, authError.status);
      
      // Mensagens de erro mais específicas baseadas no tipo de erro
      let errorMessage = 'Credenciais inválidas';
      
      if (authError.message.includes('Invalid login credentials') || 
          authError.message.includes('invalid_credentials') ||
          authError.message.includes('Invalid email or password')) {
        errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
      } else if (authError.message.includes('Email not confirmed') || 
                 authError.message.includes('email_not_confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.';
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

    // Verificar se é um customer ou se pode se tornar um
    const userType = authData.user?.user_metadata?.user_type;
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
        email: authData.user.email,
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
