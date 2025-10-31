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
            isActive: true,
            stockType: true,
            stockLines: {
              where: {
                isDeleted: false,
                isUsed: false
              },
              select: {
                id: true
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Buscar todos os ResellListing ativos para determinar quais produtos são importados
    const resellListings = await prisma.resellListing.findMany({
      where: {
        storeId: seller.store.id,
        isActive: true
      },
      include: {
        sourceProduct: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    // Criar um mapa de produtos importados: chave = name+price, valor = true
    const importedProductsMap = new Map<string, boolean>();
    resellListings.forEach(listing => {
      if (listing.sourceProduct) {
        const key = `${listing.sourceProduct.name}|${listing.sourceProduct.price}`;
        importedProductsMap.set(key, true);
      }
    });

    // Formatar dados para compatibilidade com o frontend
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      order: category.order,
      products: category.products.map(product => {
        // Verificar se o produto é importado baseado no ResellListing
        const productKey = `${product.name}|${product.price}`;
        const isImported = importedProductsMap.has(productKey);
        
        return {
          id: product.id,
          title: product.name,
          price: product.price,
          imageUrl: product.imageUrl || '/product1.gif', // Usar imagem padrão se não houver imagem
          order: product.order,
          stock: 0, // Placeholder - será implementado quando necessário
          stockType: product.stockType,
          stockLinesCount: product.stockLines?.length || 0,
          isImported
        };
      })
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
