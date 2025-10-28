import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessToken } from '@/lib/utils/authUtils';
import { AuthService } from '@/lib/services/authService';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 15 produtos por IP a cada 10 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`product-create:${identifier}`, {
      maxRequests: 15,
      windowMs: 10 * 60 * 1000, // 10 minutos
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Muitas tentativas de criação de produto. Aguarde alguns minutos.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '15',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }
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

    const body = await request.json();
    console.log('Dados recebidos para criação do produto:', {
      name: body.name,
      price: body.price,
      categoryId: body.categoryId,
      stockType: body.stockType,
      stockLinesCount: body.stockLines?.length || 0,
      deliverablesCount: body.deliverables?.length || 0
    });

    const {
      name,
      description,
      price,
      imageUrl,
      image2Url,
      image3Url,
      videoUrl,
      categoryId,
      stockType,
      fixedContent,
      keyAuthDays,
      keyAuthSellerKey,
      stockLines,
      deliverables
    } = body;

    // Validações obrigatórias
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Descrição é obrigatória' }, { status: 400 });
    }

    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Preço deve ser maior que zero' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 });
    }

    // Verificar se a categoria pertence à loja
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        storeId: store.id,
        isActive: true
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    // Verificar se já existe produto com o mesmo nome na categoria
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: name.trim(),
        categoryId,
        storeId: store.id,
        isActive: true
      }
    });

    if (existingProduct) {
      return NextResponse.json({ error: 'Já existe um produto com este nome nesta categoria' }, { status: 409 });
    }

    // Buscar o próximo order na categoria
    const lastProduct = await prisma.product.findFirst({
      where: {
        categoryId,
        storeId: store.id,
        isActive: true
      },
      orderBy: { order: 'desc' }
    });

    const nextOrder = lastProduct ? lastProduct.order + 1 : 0;

    // Criar produto com transação
    const result = await prisma.$transaction(async (tx) => {
      console.log('Criando produto no banco de dados...');
      
      // Criar o produto
      const product = await tx.product.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          imageUrl: imageUrl || null,
          image2Url: image2Url || null,
          image3Url: image3Url || null,
          videoUrl: videoUrl || null,
          stockType: stockType || 'LINE',
          fixedContent: fixedContent || null,
          keyAuthDays: keyAuthDays ? parseInt(keyAuthDays) : null,
          keyAuthSellerKey: keyAuthSellerKey || null,
          order: nextOrder,
          storeId: store.id,
          categoryId
        }
      });

      console.log('Produto criado com ID:', product.id);

      // Criar linhas de estoque se fornecidas
      if (stockLines && Array.isArray(stockLines) && stockLines.length > 0) {
        console.log('Criando', stockLines.length, 'linhas de estoque...');
        await tx.stockLine.createMany({
          data: stockLines.map((line: { content: string }) => ({
            content: line.content.trim(),
            productId: product.id
          }))
        });
        console.log('Linhas de estoque criadas com sucesso');
      }

      // Criar entregáveis se fornecidos
      if (deliverables && Array.isArray(deliverables) && deliverables.length > 0) {
        console.log('Criando', deliverables.length, 'entregáveis...');
        await tx.deliverable.createMany({
          data: deliverables.map((deliverable: { name: string; url: string }) => ({
            name: deliverable.name.trim(),
            url: deliverable.url.trim(),
            productId: product.id
          }))
        });
        console.log('Entregáveis criados com sucesso');
      }

      return product;
    });

    return NextResponse.json({
      success: true,
      product: {
        id: result.id,
        name: result.name,
        description: result.description,
        price: result.price,
        imageUrl: result.imageUrl,
        image2Url: result.image2Url,
        image3Url: result.image3Url,
        videoUrl: result.videoUrl,
        stockType: result.stockType,
        fixedContent: result.fixedContent,
        keyAuthDays: result.keyAuthDays,
        keyAuthSellerKey: result.keyAuthSellerKey,
        order: result.order,
        isActive: result.isActive,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
