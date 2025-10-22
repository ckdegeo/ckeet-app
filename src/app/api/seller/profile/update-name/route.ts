import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';

export async function PUT(request: NextRequest) {
  try {
    // Obter token de acesso dos cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Token de acesso não encontrado' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Verificar se é um seller
    const userType = user.user_metadata?.user_type;
    if (userType !== 'seller') {
      return NextResponse.json({ error: 'Acesso negado. Apenas vendedores podem atualizar o perfil.' }, { status: 403 });
    }

    // Obter dados do request
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }

    // Atualizar nome no banco de dados
    await AuthService.updateSellerName(user.id, name.trim());

    return NextResponse.json({ 
      success: true, 
      message: 'Nome atualizado com sucesso!',
      data: { name: name.trim() }
    });

  } catch (error) {
    console.error('Erro ao atualizar nome do seller:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
