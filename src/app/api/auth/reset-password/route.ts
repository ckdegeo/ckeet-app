import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { access_token, new_password } = await request.json();

    if (!access_token || !new_password) {
      return NextResponse.json(
        { error: 'Access token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar força da senha
    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'Nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Criar cliente Supabase
    const supabase = createServerSupabaseClient();

    // Resetar senha usando Supabase
    const { error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) {
      console.error('Erro ao resetar senha:', error);
      return NextResponse.json(
        { error: 'Erro ao resetar senha' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });

  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}