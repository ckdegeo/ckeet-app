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
    const { productId, deliverables } = body;

    if (!productId) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    if (!deliverables || !Array.isArray(deliverables)) {
      return NextResponse.json({ error: 'Lista de entregáveis é obrigatória' }, { status: 400 });
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

    // Validar entregáveis
    for (const deliverable of deliverables) {
      if (!deliverable.name?.trim()) {
        return NextResponse.json({ error: 'Nome do entregável é obrigatório' }, { status: 400 });
      }
      if (!deliverable.url?.trim()) {
        return NextResponse.json({ error: 'URL do entregável é obrigatória' }, { status: 400 });
      }
      
      // Validar URL
      try {
        new URL(deliverable.url.trim());
      } catch {
        return NextResponse.json({ error: 'URL do entregável é inválida' }, { status: 400 });
      }
    }

    // Criar entregáveis em transação
    const result = await prisma.$transaction(async (tx) => {
      // Deletar entregáveis existentes (se houver)
      await tx.deliverable.deleteMany({
        where: { productId }
      });

      // Criar novos entregáveis
      const createdDeliverables = await tx.deliverable.createMany({
        data: deliverables.map((deliverable: { name: string; url: string }) => ({
          name: deliverable.name.trim(),
          url: deliverable.url.trim(),
          productId
        }))
      });

      return createdDeliverables;
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} entregáveis criados com sucesso`
    });

  } catch (error) {
    console.error('Erro ao criar entregáveis:', error);
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

    // Buscar entregáveis
    const deliverables = await prisma.deliverable.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      deliverables: deliverables.map(deliverable => ({
        id: deliverable.id,
        name: deliverable.name,
        url: deliverable.url,
        createdAt: deliverable.createdAt,
        updatedAt: deliverable.updatedAt
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar entregáveis:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
