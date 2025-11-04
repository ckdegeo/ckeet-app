import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase';
import { getAccessToken } from '@/lib/utils/authUtils';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';

// Troca de senha do CUSTOMER autenticado
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting: 3 tentativas por 15 minutos por identificador
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`customer-change-password:${identifier}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em alguns minutos.', retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        },
      );
    }

    // Autenticação
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Token de acesso não fornecido' }, { status: 401 });
    }

    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Somente customers podem usar esta rota
    if (user.user_metadata?.user_type !== 'customer') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Nova senha e confirmação não coincidem' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    // Verificar senha atual via signIn
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });
    if (signInError) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 });
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      console.error('[CUSTOMER] Erro ao atualizar senha:', updateError);
      return NextResponse.json({ error: `Erro ao atualizar senha: ${updateError.message}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('[CUSTOMER] Erro ao alterar senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}


