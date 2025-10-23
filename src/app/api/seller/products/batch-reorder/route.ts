import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessToken } from '@/lib/utils/authUtils';
import { AuthService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
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
    const { products } = body;

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Lista de produtos é obrigatória' }, { status: 400 });
    }

    // Validar se todos os produtos pertencem à loja
    const productIds = products.map((p: { id: string; order: number }) => p.id);
    const existingProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id
      },
      select: { id: true }
    });

    if (existingProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Alguns produtos não foram encontrados' }, { status: 404 });
    }

    // Atualizar ordem dos produtos em transação
    await prisma.$transaction(
      products.map((product: { id: string; order: number }) =>
        prisma.product.update({
          where: { id: product.id },
          data: { order: product.order }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Ordem dos produtos atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao reordenar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
