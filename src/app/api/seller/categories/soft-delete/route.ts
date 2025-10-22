import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
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

    const { categoryId } = await request.json();

    if (!categoryId) {
      return NextResponse.json(
        { error: 'ID da categoria é obrigatório' },
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
      },
      include: {
        products: {
          where: { isActive: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a categoria tem produtos ativos
    if (existingCategory.products.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir uma categoria que possui produtos. Remova todos os produtos primeiro.' },
        { status: 400 }
      );
    }

    // Soft delete - apenas marcar como inativa
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Categoria removida com sucesso!',
      category: {
        id: updatedCategory.id,
        name: updatedCategory.name,
        isActive: updatedCategory.isActive,
        updatedAt: updatedCategory.updatedAt
      }
    });

  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
