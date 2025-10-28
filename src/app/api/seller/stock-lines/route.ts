import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const sellerId = searchParams.get('sellerId');

    if (!productId && !sellerId) {
      return NextResponse.json(
        { error: 'Product ID ou Seller ID é obrigatório' },
        { status: 400 }
      );
    }

    const whereClause: { productId?: string; product?: { store: { sellerId: string } } } = {};

    if (productId) {
      whereClause.productId = productId;
    } else if (sellerId) {
      // Buscar todas as linhas de estoque dos produtos do seller
      whereClause.product = {
        store: {
          sellerId: sellerId
        }
      };
    }

    // Buscar linhas de estoque com informações do produto e pedido
    const stockLines = await prisma.stockLine.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stockType: true,
            store: {
              select: {
                name: true,
                sellerId: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Separar linhas disponíveis e vendidas
    const availableStock = stockLines.filter(line => !line.isUsed && !line.isDeleted);
    const soldStock = stockLines.filter(line => line.isUsed && line.isDeleted);
    const usedStock = stockLines.filter(line => line.isUsed && !line.isDeleted); // Linhas marcadas como usadas mas não deletadas (casos antigos)

    // Estatísticas por produto
    const productStats = stockLines.reduce((acc: Record<string, {
      productId: string;
      productName: string;
      stockType: string;
      storeName: string;
      total: number;
      available: number;
      sold: number;
      used: number;
    }>, line) => {
      const productId = line.productId;
      if (!acc[productId]) {
        acc[productId] = {
          productId: productId,
          productName: line.product.name,
          stockType: line.product.stockType,
          storeName: line.product.store.name,
          total: 0,
          available: 0,
          sold: 0,
          used: 0
        };
      }
      
      acc[productId].total++;
      if (!line.isUsed && !line.isDeleted) acc[productId].available++;
      if (line.isUsed && line.isDeleted) acc[productId].sold++;
      if (line.isUsed && !line.isDeleted) acc[productId].used++;
      
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      stockLines: stockLines,
      availableStock: availableStock,
      soldStock: soldStock,
      usedStock: usedStock,
      productStats: Object.values(productStats),
      summary: {
        total: stockLines.length,
        available: availableStock.length,
        sold: soldStock.length,
        used: usedStock.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar linhas de estoque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 linhas de estoque por IP a cada 5 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`stock-line-create:${identifier}`, {
      maxRequests: 20,
      windowMs: 5 * 60 * 1000, // 5 minutos
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Muitas tentativas de criação de linha de estoque. Aguarde alguns minutos.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }

    const { productId, content } = await request.json();

    if (!productId || !content) {
      return NextResponse.json(
        { error: 'Product ID e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe e é do tipo LINE
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            sellerId: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    if (product.stockType !== 'LINE') {
      return NextResponse.json(
        { error: 'Apenas produtos do tipo LINE podem ter linhas de estoque' },
        { status: 400 }
      );
    }

    // Criar nova linha de estoque
    const stockLine = await prisma.stockLine.create({
      data: {
        productId: productId,
        content: content.trim(),
        isUsed: false,
        isDeleted: false
      }
    });

    return NextResponse.json({
      success: true,
      stockLine: stockLine
    });

  } catch (error) {
    console.error('Erro ao criar linha de estoque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, content } = await request.json();

    if (!id || !content) {
      return NextResponse.json(
        { error: 'ID e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a linha existe
    const stockLine = await prisma.stockLine.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            store: {
              select: {
                sellerId: true
              }
            }
          }
        }
      }
    });

    if (!stockLine) {
      return NextResponse.json(
        { error: 'Linha de estoque não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a linha foi vendida
    if (stockLine.isUsed && stockLine.isDeleted) {
      return NextResponse.json(
        { error: 'Não é possível editar uma linha já vendida' },
        { status: 400 }
      );
    }

    // Atualizar a linha de estoque
    const updatedStockLine = await prisma.stockLine.update({
      where: { id },
      data: {
        content: content.trim()
      }
    });

    return NextResponse.json({
      success: true,
      stockLine: updatedStockLine
    });

  } catch (error) {
    console.error('Erro ao editar linha de estoque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stockLineId = searchParams.get('id');

    if (!stockLineId) {
      return NextResponse.json(
        { error: 'Stock Line ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a linha existe e não foi vendida
    const stockLine = await prisma.stockLine.findUnique({
      where: { id: stockLineId }
    });

    if (!stockLine) {
      return NextResponse.json(
        { error: 'Linha de estoque não encontrada' },
        { status: 404 }
      );
    }

    if (stockLine.isUsed && stockLine.isDeleted) {
      return NextResponse.json(
        { error: 'Não é possível deletar uma linha já vendida' },
        { status: 400 }
      );
    }

    // Soft delete da linha de estoque
    await prisma.stockLine.update({
      where: { id: stockLineId },
      data: {
        isDeleted: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Linha de estoque removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar linha de estoque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
