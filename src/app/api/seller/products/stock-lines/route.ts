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
    const { productId, stockLines } = body;

    if (!productId) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    if (!stockLines || !Array.isArray(stockLines)) {
      return NextResponse.json({ error: 'Lista de linhas de estoque é obrigatória' }, { status: 400 });
    }

    // Verificar se o produto existe e pertence à loja
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: store.id
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Validar linhas de estoque
    for (const line of stockLines) {
      if (!line.content?.trim()) {
        return NextResponse.json({ error: 'Conteúdo da linha de estoque é obrigatório' }, { status: 400 });
      }
    }

    // Criar linhas de estoque em transação
    const result = await prisma.$transaction(async (tx) => {
      // Deletar linhas existentes (se houver)
      await tx.stockLine.deleteMany({
        where: { productId }
      });

      // Criar novas linhas
      const createdLines = await tx.stockLine.createMany({
        data: stockLines.map((line: { content: string }) => ({
          content: line.content.trim(),
          productId
        }))
      });

      return createdLines;
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} linhas de estoque criadas com sucesso`
    });

  } catch (error) {
    console.error('Erro ao criar linhas de estoque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    // Verificar se o produto existe e pertence à loja
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: store.id
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Buscar linhas de estoque
    const stockLines = await prisma.stockLine.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      stockLines: stockLines.map(line => ({
        id: line.id,
        content: line.content,
        isUsed: line.isUsed,
        usedAt: line.usedAt,
        orderId: line.orderId,
        createdAt: line.createdAt,
        updatedAt: line.updatedAt
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar linhas de estoque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
