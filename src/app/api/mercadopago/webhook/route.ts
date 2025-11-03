import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

// Desabilitar cache para garantir logs em produção
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  // Logs antes de qualquer coisa
  console.log('🔔 [WEBHOOK] ========== WEBHOOK INICIADO ==========');
  console.log('🔔 [WEBHOOK] Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log('🔔 [WEBHOOK] Body recebido:', JSON.stringify(body, null, 2));
    console.log('🔔 [WEBHOOK] Type:', body.type);
    console.log('🔔 [WEBHOOK] Payment ID:', body.data?.id);
    
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
      console.log('⚠️ [WEBHOOK] Tipo não é payment, ignorando');
      return NextResponse.json({ success: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.log('⚠️ [WEBHOOK] Payment ID não encontrado, ignorando');
      return NextResponse.json({ success: true });
    }

    console.log('🔍 [WEBHOOK] Buscando transação com mpPaymentId:', paymentId);

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
      console.log('⚠️ [WEBHOOK] Transação não encontrada para paymentId:', paymentId);
      return NextResponse.json({ success: true });
    }

    console.log('✅ [WEBHOOK] Transação encontrada:', {
      id: transaction.id,
      orderId: transaction.orderId,
      status: transaction.status,
      gatewayStatus: transaction.gatewayStatus
    });

    // Buscar configuração do Mercado Pago
    const mpConfig = transaction.order.store.seller?.paymentConfigs?.[0];
    if (!mpConfig || !mpConfig.accessToken) {
      console.log('⚠️ [WEBHOOK] Configuração do Mercado Pago não encontrada');
      return NextResponse.json({ success: true });
    }

    console.log('✅ [WEBHOOK] Configuração MP encontrada para seller:', transaction.order.store.sellerId);

    // Consultar status atualizado no Mercado Pago
    console.log('🔍 [WEBHOOK] Consultando status no Mercado Pago...');
    let paymentStatus;
    try {
      paymentStatus = await MercadoPagoService.getPaymentStatus({
        paymentId,
        accessToken: mpConfig.accessToken
      });
      console.log('✅ [WEBHOOK] Status obtido do MP:', paymentStatus);
    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao consultar status no Mercado Pago:', error);
      // Se falhar, usar o status da transação já existente
      paymentStatus = { 
        success: true, 
        status: transaction.gatewayStatus || 'pending' 
      };
      console.log('⚠️ [WEBHOOK] Usando status existente:', paymentStatus);
    }

    if (!paymentStatus.success) {
      console.log('⚠️ [WEBHOOK] Status não obtido com sucesso, abortando');
      return NextResponse.json({ success: true });
    }


    // Atualizar transação
    console.log('📝 [WEBHOOK] Atualizando transação...');
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: paymentStatus.status === 'approved' ? 'COMPLETED' : 
                paymentStatus.status === 'rejected' ? 'FAILED' : 'PENDING',
        gatewayStatus: paymentStatus.status,
        gatewayResponse: JSON.stringify(paymentStatus)
      }
    });
    console.log('✅ [WEBHOOK] Transação atualizada');

    // Atualizar order baseado no status
    console.log('🔍 [WEBHOOK] Status do pagamento:', paymentStatus.status);
    console.log('🔍 [WEBHOOK] Status detail:', paymentStatus.statusDetail);
    
    // Accept both 'approved' and 'processed' statuses (PIX)
    if (paymentStatus.status === 'approved' || paymentStatus.status === 'processed') {
      console.log('✅ [WEBHOOK] Pagamento aprovado! Iniciando processo de entrega...');
      const updatedOrder = await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID'
        },
        include: {
          store: {
            include: {
              seller: true
            }
          }
        }
      });

      // Enviar notificação Pushcut para venda aprovada (fire-and-forget)
      if (updatedOrder.store?.seller?.id) {
        const { NotificationService } = await import('@/lib/services/notificationService');
        NotificationService.sendPushcut(updatedOrder.store.seller.id, 'approved', {
          title: '💰 Venda Aprovada',
          text: `Pedido ${updatedOrder.orderNumber} no valor de R$ ${updatedOrder.totalAmount.toFixed(2)}`,
          data: { orderId: updatedOrder.id, orderNumber: updatedOrder.orderNumber, amount: updatedOrder.totalAmount }
        }).catch(err => console.error('[WEBHOOK] Erro ao enviar Pushcut approved:', err));
      }

      // Entregar conteúdo automaticamente
      try {
        console.log('📦 [WEBHOOK] ========== INICIANDO ENTREGA ==========');
        console.log('📦 [WEBHOOK] Order ID:', transaction.orderId);
        
        // Buscar order completa
        console.log('🔍 [WEBHOOK] Buscando order completa...');
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

        console.log('✅ [WEBHOOK] Order encontrada:', {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          productsCount: order.products.length
        });

        // Verificar se já foi entregue
        console.log('🔍 [WEBHOOK] Verificando purchases existentes...');
        const existingPurchases = await prisma.purchase.findMany({
          where: { orderId: order.id }
        });

        console.log('📊 [WEBHOOK] Purchases existentes:', existingPurchases.length);

        if (existingPurchases.length > 0) {
          console.log('⚠️ [WEBHOOK] Conteúdo já foi entregue anteriormente');
          return NextResponse.json({ success: true });
        }

        // Processar cada produto do pedido
        console.log('🔄 [WEBHOOK] Processando', order.products.length, 'produto(s)...');
        
        for (const orderItem of order.products) {
          console.log('📦 [WEBHOOK] ========== PRODUTO ==========');
          console.log('📦 [WEBHOOK] OrderItem ID:', orderItem.id);
          console.log('📦 [WEBHOOK] Product ID:', orderItem.productId);
          
          // Buscar produto completo com estoque e deliverables
          console.log('🔍 [WEBHOOK] Buscando produto completo...');
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
            console.error(`❌ [WEBHOOK] Produto não encontrado: ${orderItem.productId}`);
            continue;
          }

          console.log('✅ [WEBHOOK] Produto encontrado:', {
            id: product.id,
            name: product.name,
            stockType: product.stockType,
            stockLinesCount: product.stockLines.length,
            deliverablesCount: product.deliverables?.length || 0
          });

          let deliveredContent = null;
          let stockLineId = null;
          let downloadUrl = null;

          // Determinar conteúdo baseado no tipo de estoque
          console.log('🔍 [WEBHOOK] Processando stockType:', product.stockType);
          
          if (product.stockType === 'LINE') {
            console.log('📦 [WEBHOOK] Tipo LINE - buscando linha de estoque...');
            const availableStockLine = product.stockLines[0];
            
            if (availableStockLine) {
              console.log('✅ [WEBHOOK] Linha de estoque encontrada:', {
                id: availableStockLine.id,
                content: availableStockLine.content?.substring(0, 20) + '...'
              });
              
              // SOFT DELETE: Marcar linha como usada e deletada
              console.log('📝 [WEBHOOK] Marcando linha como usada...');
              await prisma.stockLine.update({
                where: { id: availableStockLine.id },
                data: {
                  isUsed: true,
                  isDeleted: true,
                  usedAt: new Date(),
                  orderId: order.id
                }
              });
              console.log('✅ [WEBHOOK] Linha marcada como usada');

              deliveredContent = availableStockLine.content;
              stockLineId = availableStockLine.id;
            } else {
              console.error(`❌ [WEBHOOK] Estoque insuficiente para produto: ${product.name}`);
              continue;
            }
          } else if (product.stockType === 'FIXED') {
            console.log('📦 [WEBHOOK] Tipo FIXED - usando conteúdo fixo...');
            if (product.fixedContent && product.fixedContent.trim() !== '') {
              deliveredContent = product.fixedContent;
              console.log('✅ [WEBHOOK] Conteúdo fixo encontrado');
            } else {
              console.error(`❌ [WEBHOOK] Produto ${product.name} não tem conteúdo fixo configurado`);
              continue;
            }
          } else if (product.stockType === 'KEYAUTH') {
            console.log('📦 [WEBHOOK] Tipo KEYAUTH - delegando para check-delivery...');
            // KeyAuth será processado pelo check-delivery para evitar duplicação
            continue;
          }

          // Buscar deliverables do produto
          console.log('🔍 [WEBHOOK] Verificando deliverables...');
          if (product.deliverables && product.deliverables.length > 0) {
            downloadUrl = product.deliverables[0].url;
            console.log('✅ [WEBHOOK] Deliverable encontrado:', downloadUrl);
          } else {
            console.log('⚠️ [WEBHOOK] Nenhum deliverable encontrado');
          }

          // Só criar purchase se tiver conteúdo ou download para entregar
          if (!deliveredContent && !downloadUrl) {
            console.log(`⚠️ [WEBHOOK] Produto ${product.name} sem conteúdo disponível para entrega`);
            continue;
          }

          // Criar purchase record
          console.log('📝 [WEBHOOK] Criando purchase...');
          console.log('📝 [WEBHOOK] Dados do purchase:', {
            orderId: order.id,
            customerId: order.customerId,
            hasContent: !!deliveredContent,
            stockLineId: stockLineId,
            downloadUrl: downloadUrl
          });

          const purchase = await prisma.purchase.create({
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

          console.log(`✅ [WEBHOOK] Purchase criado com sucesso!`, {
            purchaseId: purchase.id,
            productName: product.name
          });
        }

        console.log('🎉 [WEBHOOK] ========== ENTREGA CONCLUÍDA ==========');
      } catch (deliverError: unknown) {
        console.error(`❌ [WEBHOOK] ========== ERRO NA ENTREGA ==========`);
        console.error(`❌ [WEBHOOK] Erro:`, deliverError);
        console.error(`❌ [WEBHOOK] Stack:`, deliverError instanceof Error ? deliverError.stack : 'N/A');
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

    console.log('✅ [WEBHOOK] ========== WEBHOOK FINALIZADO ==========');
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('❌ [WEBHOOK] ========== ERRO GERAL ==========');
    console.error('❌ [WEBHOOK] Erro:', error);
    console.error('❌ [WEBHOOK] Message:', error instanceof Error ? error.message : 'N/A');
    console.error('❌ [WEBHOOK] Stack:', error instanceof Error ? error.stack : 'N/A');
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
