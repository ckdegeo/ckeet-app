import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
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

    if (user.user_metadata?.user_type !== 'seller') {
      return NextResponse.json(
        { error: 'Usuário não é seller' },
        { status: 403 }
      );
    }

    const { categories } = await request.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Lista de categorias é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar a loja do seller
    const seller = await prisma.seller.findUnique({
      where: { id: user.id },
      include: { store: true }
    });

    if (!seller || !seller.store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se todas as categorias pertencem à loja
    const categoryIds = categories.map(cat => cat.id);
    const existingCategories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        storeId: seller.store.id,
        isActive: true
      }
    });

    if (existingCategories.length !== categories.length) {
      return NextResponse.json(
        { error: 'Algumas categorias não foram encontradas' },
        { status: 404 }
      );
    }

    // Atualizar ordem de todas as categorias em uma transação
    await prisma.$transaction(
      categories.map((cat: { id: string; order: number }) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { order: cat.order, updatedAt: new Date() }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Ordem das categorias atualizada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao reordenar categorias em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

