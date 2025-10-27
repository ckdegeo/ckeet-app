import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomínio não fornecido' },
        { status: 400 }
      );
    }

    // Buscar a loja pelo subdomínio
    const store = await prisma.store.findUnique({
      where: {
        subdomain: subdomain,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        logoUrl: true,
        homeBannerUrl: true,
        storeBannerUrl: true,
        primaryColor: true,
        secondaryColor: true,
        subdomain: true,
        isActive: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    // Buscar categorias com produtos ordenados
    const categories = await prisma.category.findMany({
      where: {
        storeId: store.id,
        isActive: true,
      },
      include: {
        products: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            image2Url: true,
            image3Url: true,
            videoUrl: true,
            order: true,
            isActive: true,
            stockType: true,
            categoryId: true,
            storeId: true,
            createdAt: true,
            updatedAt: true,
            stockLines: {
              where: {
                isDeleted: false
              },
              select: {
                id: true,
                content: true,
                isUsed: true,
                usedAt: true,
                orderId: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({
      store,
      categories,
    });
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da loja' },
      { status: 500 }
    );
  }
}

