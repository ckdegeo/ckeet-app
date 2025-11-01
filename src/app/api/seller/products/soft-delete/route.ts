import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessToken } from '@/lib/utils/authUtils';
import { AuthService } from '@/lib/services/authService';

export async function DELETE(request: NextRequest) {
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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    // Verificar se o produto existe e pertence à loja
    const product = await prisma.product.findFirst({
      where: {
        id,
        storeId: store.id
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Verificar se o produto já está inativo
    if (!product.isActive) {
      return NextResponse.json({ 
        error: 'Produto já foi removido da loja' 
      }, { status: 409 });
    }

    // Verificar se é produto importado: buscar ResellListing que aponta para produto do catálogo
    // com mesmo nome e preço do produto sendo deletado
    const sourceProduct = await prisma.product.findFirst({
      where: {
        isCatalog: true,
        name: product.name,
        price: product.price
      }
    });

    let isImported = false;
    let resellListingId: string | null = null;

    if (sourceProduct) {
      // Verificar se existe ResellListing para este produto do catálogo nesta loja
      const resellListing = await prisma.resellListing.findFirst({
        where: {
          storeId: store.id,
          sourceProductId: sourceProduct.id
        }
      });

      if (resellListing) {
        isImported = true;
        resellListingId = resellListing.id;
      }
    }

    if (isImported && resellListingId) {
      // Produto importado: verificar se tem vendas
      const orderItemsCount = await prisma.orderItem.count({
        where: { productId: id }
      });

      if (orderItemsCount > 0) {
        // Produto importado COM vendas: SOFT DELETE para manter integridade
        await prisma.product.update({
          where: { id },
          data: { isActive: false }
        });

        // Deletar o ResellListing para permitir reimportação
        await prisma.resellListing.delete({
          where: { id: resellListingId }
        });

        return NextResponse.json({
          success: true,
          message: 'Produto importado desativado (possui histórico de vendas)'
        });
      }

      // Produto importado SEM vendas: HARD DELETE permanente
      try {
        // Deletar o ResellListing primeiro
        await prisma.resellListing.delete({
          where: { id: resellListingId }
        });

        // Deletar o produto permanentemente (CASCADE irá deletar stockLines e deliverables)
        await prisma.product.delete({
          where: { id }
        });

        return NextResponse.json({
          success: true,
          message: 'Produto importado removido permanentemente'
        });
      } catch (deleteError) {
        console.error('Erro ao deletar produto importado:', deleteError);
        
        // Se falhar o hard delete, fazer soft delete como fallback
        await prisma.product.update({
          where: { id },
          data: { isActive: false }
        });

        return NextResponse.json({
          success: true,
          message: 'Produto importado desativado'
        });
      }
    }

    // Produto PRÓPRIO do seller: SEMPRE SOFT DELETE
    await prisma.product.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Produto removido da loja com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
