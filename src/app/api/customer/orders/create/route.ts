import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/services/authService';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';
import { calculateSplitPayment, validatePaymentConfig } from '@/lib/config/payment';

// Validar configurações de pagamento
try {
  validatePaymentConfig();
} catch (error) {
  console.error('❌ Configuração de pagamento inválida:', error);
}

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar autenticação do customer
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso é obrigatório' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    
    // Decodificar token para obter customer info
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const customerId = payload.customer_id || payload.sub;
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar customer no banco
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        seller: {
          include: {
            store: true,
            paymentConfigs: {
              where: { provider: 'MERCADO_PAGO' }
            }
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer não encontrado' },
        { status: 404 }
      );
    }

    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: true,
        category: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o produto pertence à loja do customer
    if (product.storeId !== customer.seller?.store?.id) {
      return NextResponse.json(
        { error: 'Produto não pertence à loja do customer' },
        { status: 403 }
      );
    }

    // Verificar se há configuração do Mercado Pago
    const mpConfig = customer.seller?.paymentConfigs?.[0];
    if (!mpConfig || mpConfig.status !== 'CONNECTED') {
      return NextResponse.json(
        { error: 'Loja não possui integração com Mercado Pago ativa' },
        { status: 400 }
      );
    }

    // Calcular valores com split payment
    const productPrice = product.price;
    const totalAmount = productPrice * quantity;
    
    // Calcular split payment
    const split = calculateSplitPayment(totalAmount);

    // Gerar número do pedido
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Criar order no banco
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        status: 'PENDING',
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: customer.phone,
        paymentMethod: 'PIX',
        paymentStatus: 'PENDING',
        storeId: product.storeId,
        customerId: customer.id,
        products: {
          create: {
            productId: product.id,
            quantity,
            price: productPrice
          }
        }
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });

    // Gerar PIX via Mercado Pago
    const pixData = await MercadoPagoService.createPixPayment({
      amount: totalAmount,
      description: `Compra: ${product.name}`,
      externalReference: orderNumber,
      sellerAccessToken: mpConfig.accessToken!,
      sellerCollectorId: mpConfig.userId!,
      applicationFee: split.platformAmount
    });

    if (!pixData.success) {
      return NextResponse.json(
        { error: 'Erro ao gerar PIX: ' + pixData.error },
        { status: 500 }
      );
    }

    // Criar transação no banco
    await prisma.transaction.create({
      data: {
        type: 'SALE',
        amount: totalAmount,
        status: 'PENDING',
        description: `Pagamento PIX - ${product.name}`,
        paymentProvider: 'MERCADO_PAGO',
        sellerAmount: split.sellerAmount,
        platformAmount: split.platformAmount,
        commissionRate: split.commissionRate,
        commissionFixedFee: split.commissionFixedFee,
        gatewayTransactionId: pixData.paymentId,
        gatewayResponse: JSON.stringify(pixData),
        gatewayStatus: 'pending',
        mpPaymentId: pixData.paymentId,
        mpCollectorId: mpConfig.userId!,
        mpApplicationFee: split.platformAmount,
        orderId: order.id,
        customerId: customer.id,
        storeId: product.storeId
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      },
      pix: {
        qrCode: pixData.qrCode,
        qrCodeText: pixData.qrCodeText,
        paymentId: pixData.paymentId,
        expiresAt: pixData.expiresAt
      },
      split: {
        totalAmount: split.totalAmount,
        sellerAmount: split.sellerAmount,
        platformAmount: split.platformAmount,
        commissionRate: split.commissionRate,
        commissionFixedFee: split.commissionFixedFee
      }
    });

  } catch (error) {
    console.error('Erro ao criar order:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
