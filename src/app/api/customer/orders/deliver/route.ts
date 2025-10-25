import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar order com todos os dados necessários
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        customer: true,
        products: {
          include: {
            product: {
              include: {
                stockLines: {
                  where: { isUsed: false },
                  take: 1
                },
                deliverables: true
              }
            }
          }
        },
        transactions: {
          where: { type: 'SALE', status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o pedido está pago
    if (order.status !== 'PAID' || order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Pedido não está pago' },
        { status: 400 }
      );
    }

    // Verificar se já foi entregue
    const existingPurchase = await prisma.purchase.findFirst({
      where: { orderId: order.id }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Conteúdo já foi entregue' },
        { status: 400 }
      );
    }

    const deliveries = [];

    // Processar cada produto do pedido
    for (const orderItem of order.products) {
      const product = orderItem.product;
      let deliveredContent = '';
      let stockLineId = null;

      // Lógica de entrega baseada no tipo de estoque
      if (product.stockType === 'LINE') {
        // Estoque por linha - usar primeira linha disponível
        const availableStockLine = product.stockLines[0];
        
        if (!availableStockLine) {
          return NextResponse.json(
            { error: `Produto ${product.name} está fora de estoque` },
            { status: 400 }
          );
        }

        // Marcar linha como usada
        await prisma.stockLine.update({
          where: { id: availableStockLine.id },
          data: {
            isUsed: true,
            usedAt: new Date(),
            orderId: order.id
          }
        });

        deliveredContent = availableStockLine.content;
        stockLineId = availableStockLine.id;

      } else if (product.stockType === 'FIXED') {
        // Estoque fixo - usar conteúdo fixo
        deliveredContent = product.fixedContent || '';

      } else if (product.stockType === 'KEYAUTH') {
        // KeyAuth - gerar chave temporária (implementar lógica específica)
        deliveredContent = `KeyAuth: ${product.keyAuthPublicKey} (${product.keyAuthDays} dias)`;
      }

      // Criar registro de entrega
      const purchase = await prisma.purchase.create({
        data: {
          orderId: order.id,
          customerId: order.customerId!,
          deliveredContent,
          stockLineId,
          downloadUrl: product.deliverables[0]?.url || null,
          expiresAt: product.deliverables[0]?.url ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // 7 dias
        }
      });

      deliveries.push({
        productId: product.id,
        productName: product.name,
        deliveredContent,
        downloadUrl: purchase.downloadUrl,
        expiresAt: purchase.expiresAt
      });
    }

    // Atualizar status do pedido para entregue
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DELIVERED' }
    });

    return NextResponse.json({
      success: true,
      message: 'Conteúdo entregue com sucesso',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'DELIVERED'
      },
      deliveries
    });

  } catch (error) {
    console.error('Erro ao entregar conteúdo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
