import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';

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

    // Enviar email de recuperação
    await AuthService.forgotPassword(email);

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
