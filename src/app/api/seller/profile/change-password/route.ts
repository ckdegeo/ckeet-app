import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';
import { getAccessToken } from '@/lib/utils/authUtils';
import { AuthService } from '@/lib/services/authService';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting: 3 tentativas de troca de senha por IP a cada 15 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`change-password:${identifier}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000, // 15 minutos
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Muitas tentativas de troca de senha. Tente novamente em alguns minutos.',
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

    // Verificar autenticação
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Token de acesso não fornecido' }, { status: 401 });
    }

    const seller = await AuthService.verifyToken(accessToken);
    if (!seller) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validações obrigatórias
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se as senhas coincidem
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Nova senha e confirmação não coincidem' },
        { status: 400 }
      );
    }

    // Validar força da nova senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se a senha atual está correta
    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    // Verificar senha atual fazendo login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 401 }
      );
    }

    // Atualizar senha usando o método do AuthService
    await AuthService.updatePassword(accessToken, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
