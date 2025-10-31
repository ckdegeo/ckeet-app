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

    if (sourceProduct) {
      // Verificar se existe ResellListing para este produto do catálogo nesta loja
      const resellListing = await prisma.resellListing.findFirst({
        where: {
          storeId: store.id,
          sourceProductId: sourceProduct.id
        }
      });

      if (resellListing) {
        // Produto importado: HARD DELETE (deletar permanentemente)
        // Primeiro deletar o ResellListing relacionado
        await prisma.resellListing.delete({
          where: { id: resellListing.id }
        });

        // Depois deletar o produto permanentemente
        await prisma.product.delete({
          where: { id }
        });

        return NextResponse.json({
          success: true,
          message: 'Produto importado removido permanentemente'
        });
      }
    }

    // Produto normal do seller: SOFT DELETE
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
