import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessToken } from '@/lib/utils/authUtils';
import { AuthService } from '@/lib/services/authService';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const accessToken = getAccessToken(request);
    if (!accessToken) {
      return NextResponse.json({ error: 'Token de acesso não fornecido' }, { status: 401 });
    }

    const seller = await AuthService.verifyToken(accessToken);
    if (!seller) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Buscar a loja do seller
    const store = await prisma.store.findUnique({
      where: { sellerId: seller.id }
    });

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 });
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Construir filtros
    const where: {
      storeId: string;
      id?: string;
      categoryId?: string;
      isActive?: boolean;
    } = {
      storeId: store.id
    };

    if (productId) {
      where.id = productId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (!includeInactive) {
      where.isActive = true;
    }

    // Buscar produtos com paginação
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              order: true
            }
          },
          stockLines: {
            where: {
              isDeleted: false,
              isUsed: false
            },
            select: {
              id: true,
              content: true,
              isUsed: true,
              usedAt: true,
              orderId: true
            }
          },
          deliverables: {
            select: {
              id: true,
              name: true,
              url: true
            }
          },
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: [
          { category: { order: 'asc' } },
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Calcular estatísticas
    const stats = await prisma.product.aggregate({
      where: {
        storeId: store.id,
        isActive: true
      },
      _count: {
        id: true
      },
      _sum: {
        price: true
      }
    });

    return NextResponse.json({
      success: true,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        image2Url: product.image2Url,
        image3Url: product.image3Url,
        videoUrl: product.videoUrl,
        stockType: product.stockType,
        fixedContent: product.fixedContent,
        keyAuthDays: product.keyAuthDays,
        keyAuthSellerKey: product.keyAuthSellerKey,
        order: product.order,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        categoryId: product.categoryId, // ← ADICIONADO!
        category: product.category,
        stockLines: product.stockLines,
        deliverables: product.deliverables,
        salesCount: product._count.orderItems
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        totalProducts: stats._count.id,
        totalValue: stats._sum.price || 0
      }
    });

  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
