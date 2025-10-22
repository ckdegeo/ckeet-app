import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

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

    if (user.user_metadata?.user_type !== 'seller') {
      return NextResponse.json(
        { error: 'Usuário não é seller' },
        { status: 403 }
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

    // Buscar todas as categorias ativas da loja com seus produtos
    const categories = await prisma.category.findMany({
      where: {
        storeId: seller.store.id,
        isActive: true
      },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            order: true,
            isActive: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Formatar dados para compatibilidade com o frontend
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      order: category.order,
      products: category.products.map(product => ({
        id: product.id,
        title: product.name,
        price: product.price,
        imageUrl: product.imageUrl || '',
        order: product.order,
        stock: 0 // Placeholder - será implementado quando necessário
      }))
    }));

    return NextResponse.json({
      success: true,
      categories: formattedCategories,
      total: formattedCategories.length
    });

  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
