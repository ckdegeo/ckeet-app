import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [Login] Iniciando processo de login...');
    const { email, password } = await request.json();
    console.log('📧 [Login] Email:', email);

    // Validar dados de entrada
    if (!email || !password) {
      console.log('❌ [Login] Email ou senha não fornecidos');
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Usar ANON_KEY para autenticação de usuário (não SERVICE_ROLE_KEY)
    console.log('🔧 [Login] Criando cliente Supabase com ANON_KEY...');
    console.log('🔧 [Login] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
    console.log('🔧 [Login] ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('✅ [Login] Cliente Supabase criado');
    console.log('🔑 [Login] Tentando autenticar no Supabase...');

    // Fazer login no Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ [Login] Erro de autenticação:', authError.message);
      console.error('❌ [Login] Erro completo:', JSON.stringify(authError, null, 2));
      
      // Verificar se é erro de email não confirmado
      if (authError.message === 'Email not confirmed') {
        return NextResponse.json(
          { error: 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    console.log('✅ [Login] Autenticação bem-sucedida!');
    console.log('👤 [Login] User ID:', authData.user?.id);
    console.log('📧 [Login] User Email:', authData.user?.email);

    // Verificar se é um seller
    const userType = authData.user?.user_metadata?.user_type;
    
    if (userType !== 'seller') {
      return NextResponse.json(
        { error: 'Acesso negado. Esta área é apenas para vendedores.' },
        { status: 403 }
      );
    }

    // Sincronizar usuário com Prisma
    await AuthService.syncUser(authData.user);

    // Obter dados do seller
    const seller = await AuthService.getSellerByEmail(email);

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name,
        user_type: 'seller',
        seller_id: seller?.id,
        store_id: seller?.store?.id,
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
