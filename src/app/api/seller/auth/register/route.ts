import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/services/authService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      name, 
      cpf, 
      phone 
    } = await request.json();

    // Validar dados de entrada
    if (!email || !password || !name || !cpf || !phone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar formato do CPF
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
    if (!cpfRegex.test(cpf)) {
      return NextResponse.json(
        { error: 'CPF inválido' },
        { status: 400 }
      );
    }

    // Validar força da senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingSeller = await AuthService.getSellerByEmail(email);
    if (existingSeller) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se CPF já existe
    const existingCpf = await AuthService.getSellerByCpf(cpf);
    if (existingCpf) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 409 }
      );
    }

    // Registrar no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'seller',
          name,
          cpf,
          phone,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/seller/auth/login`,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Criar seller no Prisma
    const seller = await AuthService.createSeller({
      id: authData.user!.id,
      email,
      name,
      cpf,
      phone,
      password: '', // Senha gerenciada pelo Supabase
    });

    // Criar loja padrão para o seller
    const store = await AuthService.createDefaultStore(seller.id);

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para confirmar a conta.',
      user: {
        id: authData.user!.id,
        email: authData.user!.email,
        name: authData.user!.user_metadata?.name,
        user_type: 'seller',
        seller_id: seller.id,
        store_id: store.id,
      },
      // Nota: Tokens só são retornados se email_confirmed_at não for null
      ...(authData.session && {
        tokens: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
        },
      }),
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
