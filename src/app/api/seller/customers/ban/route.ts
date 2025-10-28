import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso é obrigatório' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    
    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    if (user.user_metadata?.user_type !== 'seller') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const sellerId = user.user_metadata?.seller_id || user.id;
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID do cliente é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o cliente pertence ao seller
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { sellerId: true, status: true }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    if (customer.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    if (customer.status === 'BANNED') {
      return NextResponse.json(
        { error: 'Cliente já está banido' },
        { status: 400 }
      );
    }

    // Atualizar status do cliente
    await prisma.customer.update({
      where: { id: customerId },
      data: { status: 'BANNED' }
    });

    return NextResponse.json({
      success: true,
      message: 'Cliente banido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao banir cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

