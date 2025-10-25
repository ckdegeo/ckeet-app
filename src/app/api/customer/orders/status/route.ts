import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: 'Order ID ou Payment ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar order
    let order;
    let latestTransaction;
    
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          store: {
            include: {
              seller: {
                include: {
                  paymentConfigs: {
                    where: { provider: 'MERCADO_PAGO' }
                  }
                }
              }
            }
          }
        }
      });

      if (order) {
        // Buscar transação mais recente
        latestTransaction = await prisma.transaction.findFirst({
          where: { 
            orderId: order.id,
            type: 'SALE'
          },
          orderBy: { createdAt: 'desc' }
        });
      }
    } else {
      // Buscar por paymentId na transaction
      latestTransaction = await prisma.transaction.findFirst({
        where: { mpPaymentId: paymentId },
        include: {
          order: {
            include: {
              store: {
                include: {
                  seller: {
                    include: {
                      paymentConfigs: {
                        where: { provider: 'MERCADO_PAGO' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!latestTransaction) {
        return NextResponse.json(
          { error: 'Pagamento não encontrado' },
          { status: 404 }
        );
      }

      order = latestTransaction.order;
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Verificar status no Mercado Pago
    const mpConfig = order.store.seller?.paymentConfigs?.[0];
    if (!mpConfig || !mpConfig.accessToken) {
      return NextResponse.json(
        { error: 'Configuração de pagamento não encontrada' },
        { status: 400 }
      );
    }

    if (!latestTransaction?.mpPaymentId) {
      return NextResponse.json(
        { error: 'ID de pagamento não encontrado' },
        { status: 400 }
      );
    }

    // Consultar status no Mercado Pago
    const paymentStatus = await MercadoPagoService.getPaymentStatus({
      paymentId: latestTransaction.mpPaymentId,
      accessToken: mpConfig.accessToken
    });

    if (!paymentStatus.success) {
      return NextResponse.json(
        { error: 'Erro ao consultar status: ' + paymentStatus.error },
        { status: 500 }
      );
    }

    // Atualizar status do pedido se necessário
    if (paymentStatus.status === 'approved' && order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID'
        }
      });

      // Atualizar transação
      await prisma.transaction.update({
        where: { id: latestTransaction.id },
        data: {
          status: 'COMPLETED',
          gatewayStatus: paymentStatus.status,
          gatewayResponse: JSON.stringify(paymentStatus)
        }
      });

      // Atualizar order local
      order.status = 'PAID';
      order.paymentStatus = 'PAID';
    } else if (paymentStatus.status === 'rejected' && order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      });

      // Atualizar transação
      await prisma.transaction.update({
        where: { id: latestTransaction.id },
        data: {
          status: 'FAILED',
          gatewayStatus: paymentStatus.status,
          gatewayResponse: JSON.stringify(paymentStatus)
        }
      });

      // Atualizar order local
      order.status = 'CANCELLED';
      order.paymentStatus = 'FAILED';
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      payment: {
        id: latestTransaction.mpPaymentId,
        status: paymentStatus.status,
        statusDetail: paymentStatus.statusDetail,
        transactionAmount: paymentStatus.transactionAmount,
        dateApproved: paymentStatus.dateApproved
      }
    });

  } catch (error) {
    console.error('Erro ao consultar status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
