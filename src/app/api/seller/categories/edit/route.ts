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

    const { categoryId, name } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
        { status: 400 }
      );
    }

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

    // Verificar se a categoria existe e pertence à loja do seller
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        storeId: seller.store.id,
        isActive: true
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe outra categoria com o mesmo nome na loja
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        storeId: seller.store.id,
        name: name.trim(),
        isActive: true,
        id: { not: categoryId }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 409 }
      );
    }

    // Atualizar a categoria
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Categoria atualizada com sucesso!',
      category: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        order: updatedCategory.order,
        isActive: updatedCategory.isActive,
        updatedAt: updatedCategory.updatedAt
      }
    });

  } catch (error) {
    console.error('Erro ao editar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
