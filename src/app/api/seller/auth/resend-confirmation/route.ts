import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 reenvios por IP a cada 10 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`resend:${identifier}`, {
      maxRequests: 3,
      windowMs: 10 * 60 * 1000, // 10 minutos
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Muitas tentativas de reenvio. Tente novamente em alguns minutos.',
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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Reenviar email de confirmação
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/seller/auth/login`,
      },
    });

    if (error) {
      console.error('Erro ao reenviar confirmação:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao reenviar email de confirmação' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Email de confirmação reenviado com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro no resend-confirmation:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}