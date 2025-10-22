import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
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

    // Verificar se já existe uma categoria com o mesmo nome na loja
    const existingCategory = await prisma.category.findFirst({
      where: {
        storeId: seller.store.id,
        name: name.trim(),
        isActive: true
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 409 }
      );
    }

    // Obter a próxima ordem (maior order + 1)
    const lastCategory = await prisma.category.findFirst({
      where: { storeId: seller.store.id },
      orderBy: { order: 'desc' }
    });

    const nextOrder = lastCategory ? lastCategory.order + 1 : 0;

    // Criar a categoria
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        order: nextOrder,
        storeId: seller.store.id,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Categoria criada com sucesso!',
      category: {
        id: category.id,
        name: category.name,
        order: category.order,
        isActive: category.isActive,
        createdAt: category.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
