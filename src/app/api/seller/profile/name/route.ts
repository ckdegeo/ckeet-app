import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/services/authService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Obter userId da query string
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Obter token de acesso dos cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Token de acesso não encontrado' }, { status: 401 });
    }

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Verificar se é um seller
    const userType = user.user_metadata?.user_type;
    if (userType !== 'seller') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar dados do seller no banco
    const seller = await AuthService.getSellerByEmail(user.email!);

    if (!seller) {
      return NextResponse.json({ error: 'Seller não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ 
      name: seller.name,
      email: seller.email 
    });

  } catch (error) {
    console.error('Erro ao buscar nome do seller:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
