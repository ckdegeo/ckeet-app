import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessToken } from '@/lib/utils/authUtils';
import { AuthService } from '@/lib/services/authService';

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      id,
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
      keyAuthPublicKey,
      keyAuthSellerKey
    } = body;

    // Validações obrigatórias
    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

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

    // Verificar se o produto existe e pertence à loja
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // IMPORTANTE: Impedir alteração do tipo de estoque após criação
    if (stockType && stockType !== existingProduct.stockType) {
      return NextResponse.json({ 
        error: 'O tipo de estoque não pode ser alterado após a criação do produto. Para usar outro tipo, exclua este produto e crie um novo.' 
      }, { status: 400 });
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

    // Verificar se já existe outro produto com o mesmo nome na categoria
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        name: name.trim(),
        categoryId,
        storeId: store.id,
        isActive: true,
        id: { not: id }
      }
    });

    if (duplicateProduct) {
      return NextResponse.json({ error: 'Já existe um produto com este nome nesta categoria' }, { status: 409 });
    }

    // Atualizar produto
    // Nota: stockType não é atualizado - permanece o mesmo da criação
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        image2Url: image2Url || null,
        image3Url: image3Url || null,
        videoUrl: videoUrl || null,
        // stockType mantém o valor existente
        fixedContent: fixedContent || null,
        keyAuthDays: keyAuthDays ? parseInt(keyAuthDays) : null,
        keyAuthPublicKey: keyAuthPublicKey || null,
        keyAuthSellerKey: keyAuthSellerKey || null,
        categoryId
      },
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
            isDeleted: false
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
        }
      }
    });

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        imageUrl: updatedProduct.imageUrl,
        image2Url: updatedProduct.image2Url,
        image3Url: updatedProduct.image3Url,
        videoUrl: updatedProduct.videoUrl,
        stockType: updatedProduct.stockType,
        fixedContent: updatedProduct.fixedContent,
        keyAuthDays: updatedProduct.keyAuthDays,
        keyAuthPublicKey: updatedProduct.keyAuthPublicKey,
        keyAuthSellerKey: updatedProduct.keyAuthSellerKey,
        order: updatedProduct.order,
        isActive: updatedProduct.isActive,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
        category: updatedProduct.category,
        stockLines: updatedProduct.stockLines,
        deliverables: updatedProduct.deliverables
      }
    });

  } catch (error) {
    console.error('Erro ao editar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
