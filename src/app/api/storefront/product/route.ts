import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain');
    const productId = searchParams.get('productId');

    if (!subdomain || !productId) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
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
        showStoreName: true,
        appearanceConfig: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    // Buscar o produto
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: store.id,
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
        fixedContent: true,
        keyAuthDays: true,
        keyAuthSellerKey: true,
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
        deliverables: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      store,
      product,
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    );
  }
}

