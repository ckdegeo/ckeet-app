import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('purchaseId');
    const productId = searchParams.get('productId');

    if (!purchaseId && !productId) {
      return NextResponse.json(
        { error: 'Purchase ID ou Product ID é obrigatório' },
        { status: 400 }
      );
    }

    let deliverables: { id: string; name: string; url: string; productId: string; createdAt: Date; updatedAt: Date }[] = [];

    if (purchaseId) {
      // Buscar deliverables através do purchase
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          order: {
            include: {
              products: {
                include: {
                  product: {
                    include: {
                      deliverables: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!purchase) {
        return NextResponse.json(
          { error: 'Purchase não encontrado' },
          { status: 404 }
        );
      }

      // Coletar todos os deliverables dos produtos do pedido
      deliverables = purchase.order.products.flatMap(orderItem => 
        orderItem.product.deliverables
      );
    } else if (productId) {
      // Buscar deliverables diretamente do produto
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          deliverables: true
        }
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Produto não encontrado' },
          { status: 404 }
        );
      }

      deliverables = product.deliverables;
    }

    return NextResponse.json({
      success: true,
      deliverables: deliverables
    });

  } catch (error) {
    console.error('Erro ao buscar deliverables:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, name, url } = await request.json();

    if (!productId || !name || !url) {
      return NextResponse.json(
        { error: 'Product ID, nome e URL são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Criar deliverable
    const deliverable = await prisma.deliverable.create({
      data: {
        productId: productId,
        name: name,
        url: url
      }
    });

    return NextResponse.json({
      success: true,
      deliverable: deliverable
    });

  } catch (error) {
    console.error('Erro ao criar deliverable:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deliverableId = searchParams.get('id');

    if (!deliverableId) {
      return NextResponse.json(
        { error: 'Deliverable ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o deliverable existe
    const deliverable = await prisma.deliverable.findUnique({
      where: { id: deliverableId }
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: 'Deliverable não encontrado' },
        { status: 404 }
      );
    }

    // Deletar deliverable
    await prisma.deliverable.delete({
      where: { id: deliverableId }
    });

    return NextResponse.json({
      success: true,
      message: 'Deliverable deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar deliverable:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
