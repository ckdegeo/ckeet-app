import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [WEBHOOK] Webhook recebido do Mercado Pago');
    const body = await request.json();
    console.log('🔔 [WEBHOOK] Body recebido:', JSON.stringify(body, null, 2));
    
    // Validar assinatura do webhook (se configurada)
    const signature = request.headers.get('x-signature');
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const isValid = validateWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('❌ [WEBHOOK] Assinatura inválida');
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }
    
    // Verificar se é um webhook de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ success: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ success: true });
    }


    // Buscar transação no banco
    const transaction = await prisma.transaction.findFirst({
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

    if (!transaction) {
      return NextResponse.json({ success: true });
    }

    // Buscar configuração do Mercado Pago
    const mpConfig = transaction.order.store.seller?.paymentConfigs?.[0];
    if (!mpConfig || !mpConfig.accessToken) {
      return NextResponse.json({ success: true });
    }

    // Consultar status atualizado no Mercado Pago
    let paymentStatus;
    try {
      paymentStatus = await MercadoPagoService.getPaymentStatus({
        paymentId,
        accessToken: mpConfig.accessToken
      });
    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao consultar status no Mercado Pago:', error);
      // Se falhar, usar o status da transação já existente
      paymentStatus = { 
        success: true, 
        status: transaction.gatewayStatus || 'pending' 
      };
    }

    if (!paymentStatus.success) {
      return NextResponse.json({ success: true });
    }


    // Atualizar transação
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: paymentStatus.status === 'approved' ? 'COMPLETED' : 
                paymentStatus.status === 'rejected' ? 'FAILED' : 'PENDING',
        gatewayStatus: paymentStatus.status,
        gatewayResponse: JSON.stringify(paymentStatus)
      }
    });

    // Atualizar order baseado no status
    if (paymentStatus.status === 'approved') {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID'
        }
      });

      // Entregar conteúdo automaticamente
      try {
        console.log('📦 [WEBHOOK] Iniciando entrega automática para order:', transaction.orderId);
        
        // Buscar order completa
        const order = await prisma.order.findUnique({
          where: { id: transaction.orderId },
          include: {
            products: {
              include: {
                product: true
              }
            }
          }
        });

        if (!order) {
          console.error('❌ [WEBHOOK] Order não encontrada:', transaction.orderId);
          return NextResponse.json({ success: true });
        }

        // Verificar se já foi entregue
        const existingPurchases = await prisma.purchase.findMany({
          where: { orderId: order.id }
        });

        if (existingPurchases.length > 0) {
          console.log('📦 [WEBHOOK] Conteúdo já foi entregue anteriormente');
          return NextResponse.json({ success: true });
        }

        // Processar cada produto do pedido
        for (const orderItem of order.products) {
          // Buscar produto completo com estoque e deliverables
          const product = await prisma.product.findUnique({
            where: { id: orderItem.productId },
            include: {
              stockLines: {
                where: { isUsed: false, isDeleted: false },
                orderBy: { createdAt: 'asc' },
                take: 1
              },
              deliverables: true
            }
          });

          if (!product) {
            console.error(`⚠️ [WEBHOOK] Produto não encontrado: ${orderItem.productId}`);
            continue;
          }
          let deliveredContent = null;
          let stockLineId = null;
          let downloadUrl = null;

          // Determinar conteúdo baseado no tipo de estoque
          if (product.stockType === 'LINE') {
            // Produto com estoque por linha - usar linha já buscada no include
            const availableStockLine = product.stockLines[0];
            
            if (availableStockLine) {
              // SOFT DELETE: Marcar linha como usada e deletada
              await prisma.stockLine.update({
                where: { id: availableStockLine.id },
                data: {
                  isUsed: true,
                  isDeleted: true,
                  usedAt: new Date(),
                  orderId: order.id
                }
              });

              deliveredContent = availableStockLine.content;
              stockLineId = availableStockLine.id;
            } else {
              console.error(`⚠️ [WEBHOOK] Estoque insuficiente para produto: ${product.name}`);
              continue;
            }
          } else if (product.stockType === 'FIXED') {
            // Produto com conteúdo fixo
            if (product.fixedContent && product.fixedContent.trim() !== '') {
              deliveredContent = product.fixedContent;
            } else {
              console.error(`⚠️ [WEBHOOK] Produto ${product.name} não tem conteúdo fixo configurado`);
              continue;
            }
          } else if (product.stockType === 'KEYAUTH') {
            console.error(`⚠️ [WEBHOOK] Produto KeyAuth ${product.name} - integração ainda não implementada`);
            continue;
          }

          // Buscar deliverables do produto
          if (product.deliverables && product.deliverables.length > 0) {
            downloadUrl = product.deliverables[0].url;
          }

          // Criar purchase record
          await prisma.purchase.create({
            data: {
              orderId: order.id,
              customerId: order.customerId!,
              deliveredContent: deliveredContent,
              stockLineId: stockLineId,
              downloadUrl: downloadUrl,
              expiresAt: null,
              isDownloaded: false,
              downloadCount: 0
            }
          });

          console.log(`✅ [WEBHOOK] Purchase criado para produto: ${product.name}`);
        }

        console.log('✅ [WEBHOOK] Conteúdo entregue com sucesso!');
      } catch (deliverError: unknown) {
        console.error(`❌ [WEBHOOK] Erro ao entregar conteúdo:`, deliverError instanceof Error ? deliverError.message : deliverError);
      }

    } else if (paymentStatus.status === 'rejected') {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      });

    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('❌ Erro no webhook Mercado Pago:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: true }); // Sempre retornar sucesso para o MP
  }
}

// Função para validar assinatura do webhook
function validateWebhookSignature(_body: unknown, _signature: string, _secret: string): boolean {
  try {
    // Implementar validação de assinatura conforme documentação do Mercado Pago
    // Por enquanto, retorna true (implementar validação real depois)
    
    // TODO: Implementar validação real da assinatura
    // O Mercado Pago usa HMAC-SHA256 para assinar os webhooks
    // Exemplo de implementação:
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', secret)
    //   .update(JSON.stringify(body))
    //   .digest('hex');
    // return signature === expectedSignature;
    
    return true; // Temporário - sempre aceita
  } catch (error: unknown) {
    console.error('❌ [WEBHOOK] Erro na validação de assinatura:', error instanceof Error ? error.message : error);
    return false;
  }
}
