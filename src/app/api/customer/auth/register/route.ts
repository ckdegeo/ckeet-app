import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      name, 
      phone 
    } = await request.json();

    // Validar dados de entrada
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
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
    const existingCustomer = await AuthService.getCustomerByEmail(email);
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Registrar no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'customer',
          name,
          ...(phone && { phone }),
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Criar customer no Prisma
    const customer = await AuthService.createCustomer({
      id: authData.user!.id,
      email,
      name,
      phone: phone || '',
      password: '', // Senha gerenciada pelo Supabase
    });

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para confirmar a conta.',
      user: {
        id: authData.user!.id,
        email: authData.user!.email,
        name: authData.user!.user_metadata?.name,
        user_type: 'customer',
        customer_id: customer.id,
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
