import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/services/authService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validar dados de entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Fazer login no Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
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
