import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
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

    // Enviar email de recuperação usando Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      return NextResponse.json(
        { error: 'Erro ao enviar email de recuperação' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email de recuperação enviado com sucesso',
    });

  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email de recuperação' },
      { status: 500 }
    );
  }
}
