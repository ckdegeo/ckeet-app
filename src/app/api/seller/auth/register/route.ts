import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';
import { validateEmail, validateCPF } from '@/lib/utils/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 registros por IP a cada 15 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`register:${identifier}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000, // 15 minutos
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Muitas tentativas de registro. Tente novamente em alguns minutos.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }
    
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

    // Validar domínio do email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validar CPF
    const cpfValidation = validateCPF(cpf);
    if (!cpfValidation.isValid) {
      return NextResponse.json(
        { error: cpfValidation.error },
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

    const supabase = createServerSupabaseClient();

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

    // Não criar loja automaticamente - será criada quando o usuário configurar o domínio

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para confirmar a conta.',
      user: {
        id: authData.user!.id,
        email: authData.user!.email,
        name: authData.user!.user_metadata?.name,
        user_type: 'seller',
        seller_id: seller.id,
        store_id: null, // Será criado quando configurar domínio
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