import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { checkSellerStoreCompletion } from '@/lib/utils/storeValidation';

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar se é um seller
    if (user.user_metadata?.user_type !== 'seller') {
      return NextResponse.json(
        { error: 'Usuário não é seller' },
        { status: 403 }
      );
    }

    // Verificar completude da loja
    const storeStatus = await checkSellerStoreCompletion(user.id);

    return NextResponse.json(storeStatus);

  } catch (error) {
    console.error('Erro ao verificar completude da loja:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
