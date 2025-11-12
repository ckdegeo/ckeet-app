import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 envios por IP a cada 10 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`send-otp:${identifier}`, {
      maxRequests: 5,
      windowMs: 10 * 60 * 1000, // 10 minutos
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Muitas tentativas. Tente novamente em alguns minutos.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
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

    // Usar Supabase Auth nativo para enviar OTP
    // Criar usuário temporário com signUp (sem senha, apenas para gerar OTP)
    // O usuário será criado não confirmado e receberá o código OTP
    const supabase = createServerSupabaseClient();
    
    // Criar usuário temporário sem senha (apenas para gerar OTP)
    // Se já existir, tentaremos enviar o resend
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: `temp_${Date.now()}_${Math.random()}`, // Senha temporária única
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/seller/auth/create-store`,
        data: {
          temp_signup: true,
        },
      },
    });

    // Se o erro for "User already registered", tentar enviar resend
    if (signUpError) {
      if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already exists')) {
        // Usuário já existe, tentar enviar resend
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/seller/auth/create-store`,
          },
        });

        if (resendError) {
          console.error('❌ [OTP] Erro ao reenviar OTP:', resendError);
          return NextResponse.json(
            { error: resendError.message || 'Erro ao enviar código de verificação' },
            { status: 400 }
          );
        }
      } else {
        console.error('❌ [OTP] Erro ao criar usuário temporário:', signUpError);
        return NextResponse.json(
          { error: signUpError.message || 'Erro ao enviar código de verificação' },
          { status: 400 }
        );
      }
    }

    console.log(`✅ [OTP] Código OTP enviado para ${email} via Supabase Auth`);

    return NextResponse.json({
      success: true,
      message: 'Código de verificação enviado!',
    });

  } catch (error) {
    console.error('Erro ao enviar OTP:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar código de verificação' },
      { status: 500 }
    );
  }
}

