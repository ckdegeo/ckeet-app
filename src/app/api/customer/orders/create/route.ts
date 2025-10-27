import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';
import { calculateSplitPayment, validatePaymentConfig } from '@/lib/config/payment';
import { createUserSupabaseClient } from '@/lib/supabase';

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
    
    // Validar token com Supabase usando cliente com anon key
    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError);
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Obter customer_id dos metadados do usuário
    const customerId = user.user_metadata?.customer_id;
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID não encontrado no token' },
        { status: 401 }
      );
    }

    // Buscar customer no banco
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer não encontrado' },
        { status: 404 }
      );
    }

    // Buscar produto com dados da loja
    const product = await prisma.product.findUnique({
      where: { id: productId },
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
        },
        category: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o produto está ativo
    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Produto não está disponível' },
        { status: 400 }
      );
    }

    // Verificar se a loja está ativa
    if (!product.store.isActive) {
      return NextResponse.json(
        { error: 'Loja não está ativa' },
        { status: 400 }
      );
    }

    // Verificar se há configuração do Mercado Pago na loja
    const mpConfig = product.store.seller?.paymentConfigs?.[0];
    if (!mpConfig || mpConfig.status !== 'CONNECTED') {
      return NextResponse.json(
        { error: 'Loja não possui integração com Mercado Pago ativa' },
        { status: 400 }
      );
    }

    // Verificar se o produto tem estoque disponível
    if (product.stockType === 'LINE') {
      const availableStock = await prisma.stockLine.count({
        where: {
          productId: product.id,
          isUsed: false,
          isDeleted: false
        } as { productId: string; isUsed: boolean; isDeleted: boolean }
      });
      
      if (availableStock < quantity) {
        return NextResponse.json(
          { error: 'Produto não tem estoque' },
          { status: 400 }
        );
      }
    } else if (product.stockType === 'FIXED') {
      // Para produtos FIXED, verificar se tem conteúdo configurado
      if (!product.fixedContent || product.fixedContent.trim() === '') {
        return NextResponse.json(
          { error: 'Produto não tem conteúdo configurado' },
          { status: 400 }
        );
      }
    } else if (product.stockType === 'KEYAUTH') {
      // Para produtos KEYAUTH, verificar se tem configurações
      if (!product.keyAuthPublicKey || !product.keyAuthSellerKey) {
        return NextResponse.json(
          { error: 'Produto KeyAuth não está configurado corretamente' },
          { status: 400 }
        );
      }
    }

    // Removida validação de pedido pendente duplicado
    // Cliente pode comprar o mesmo produto múltiplas vezes

    // Calcular valores com split payment
    const productPrice = product.price;
    const totalAmount = productPrice * quantity;
    
    // Validar valores
    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      );
    }
    
    // Calcular split payment
    const split = calculateSplitPayment(totalAmount);
    
    // Debug: Log dos valores calculados
    console.log('💰 [DEBUG] Valores calculados:', {
      totalAmount,
      platformAmount: split.platformAmount,
      sellerAmount: split.sellerAmount,
      commissionRate: split.commissionRate,
      commissionFixedFee: split.commissionFixedFee
    });

    // Validar application_fee para Mercado Pago
    if (split.platformAmount <= 0) {
      console.log('⚠️ [DEBUG] Application fee inválida (<= 0), usando 0.01');
      split.platformAmount = 0.01; // Mínimo permitido pelo MP
    }
    
    if (split.platformAmount >= totalAmount) {
      console.log('⚠️ [DEBUG] Application fee maior que total, ajustando');
      split.platformAmount = Math.max(0.01, totalAmount * 0.01); // 1% do total ou 0.01
    }

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
      applicationFee: split.platformAmount,
      customerEmail: customer.email,
      customerName: customer.name || undefined
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
        gatewayTransactionId: pixData.paymentId?.toString() || null,
        gatewayResponse: JSON.stringify(pixData),
        gatewayStatus: 'pending',
        mpPaymentId: pixData.paymentId?.toString() || null,
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
