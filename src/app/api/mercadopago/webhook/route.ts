import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';
import * as crypto from 'crypto';

// Desabilitar cache para garantir logs em produção
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Configuração para evitar redirecionamentos
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 segundos para processar webhook

// GET - Handler para teste do Mercado Pago (retorna 200 OK)
// O Mercado Pago faz GET para verificar se a URL está acessível antes de enviar webhooks POST
export async function GET(request: NextRequest) {
  console.log('🔔 [WEBHOOK] GET request recebido (teste do Mercado Pago)');
  console.log('🔔 [WEBHOOK] URL:', request.url);
  console.log('🔔 [WEBHOOK] Query params:', Object.fromEntries(request.nextUrl.searchParams));
  
  // Retornar 200 OK para o teste do Mercado Pago
  return NextResponse.json(
    { 
      success: true,
      message: 'Webhook endpoint está ativo e funcionando',
      timestamp: new Date().toISOString()
    },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    }
  );
}

export async function POST(request: NextRequest) {
  // Logs antes de qualquer coisa
  console.log('🔔 [WEBHOOK] ========== WEBHOOK INICIADO ==========');
  console.log('🔔 [WEBHOOK] Timestamp:', new Date().toISOString());
  console.log('🔔 [WEBHOOK] URL:', request.url);
  console.log('🔔 [WEBHOOK] Method:', request.method);
  console.log('🔔 [WEBHOOK] Headers:', {
    'content-type': request.headers.get('content-type'),
    'x-signature': request.headers.get('x-signature') ? 'present' : 'missing',
    'user-agent': request.headers.get('user-agent'),
  });
  
  try {
    // IMPORTANTE: Ler body como texto primeiro para validação de assinatura
    // O body raw é necessário para calcular o HMAC corretamente
    const bodyText = await request.text();
    
    // Validar assinatura do webhook ANTES de fazer parse do JSON
    // Isso garante que estamos validando exatamente o que o Mercado Pago enviou
    const signature = request.headers.get('x-signature');
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    
    // Estratégia de validação segura:
    // 1. Se secret configurado E assinatura presente: validar obrigatoriamente
    // 2. Se secret configurado MAS assinatura ausente: logar warning mas permitir (compatibilidade)
    // 3. Se secret não configurado: permitir (modo desenvolvimento/teste)
    if (webhookSecret) {
      if (signature) {
        // Secret configurado e assinatura presente: validar obrigatoriamente
        console.log('🔐 [WEBHOOK] Validando assinatura do webhook...');
        const isValid = validateWebhookSignature(bodyText, signature, webhookSecret);
        if (!isValid) {
          console.error('❌ [WEBHOOK] Assinatura inválida - webhook rejeitado');
          console.error('❌ [WEBHOOK] Signature recebida:', signature.substring(0, 20) + '...');
          return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
        }
        console.log('✅ [WEBHOOK] Assinatura válida - webhook autenticado');
      } else {
        // Secret configurado mas assinatura ausente: logar warning mas permitir
        // Isso permite compatibilidade com webhooks antigos ou de teste
        console.warn('⚠️ [WEBHOOK] Secret configurado mas assinatura não presente - permitindo por compatibilidade');
        console.warn('⚠️ [WEBHOOK] Recomendado: configurar assinatura no Mercado Pago para maior segurança');
      }
    } else {
      // Secret não configurado: modo desenvolvimento/teste
      console.log('ℹ️ [WEBHOOK] Secret não configurado - validação de assinatura desabilitada');
    }
    
    // Agora fazer parse do JSON para processar o webhook
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('❌ [WEBHOOK] Erro ao fazer parse do JSON:', parseError);
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
    }
    
    console.log('🔔 [WEBHOOK] Body recebido:', JSON.stringify(body, null, 2));
    console.log('🔔 [WEBHOOK] Type:', body.type);
    console.log('🔔 [WEBHOOK] Payment ID:', body.data?.id);
    
    // Verificar se é um webhook de pagamento
    if (body.type !== 'payment') {
      console.log('⚠️ [WEBHOOK] Tipo não é payment, ignorando');
      return NextResponse.json(
        { success: true },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.log('⚠️ [WEBHOOK] Payment ID não encontrado, ignorando');
      return NextResponse.json(
        { success: true },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
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
      return NextResponse.json(
        { success: true },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
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
      return NextResponse.json(
        { success: true },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
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
      return NextResponse.json(
        { success: true },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
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
        console.log('📬 [WEBHOOK] Enviando notificação Pushcut para venda aprovada...');
        console.log('📬 [WEBHOOK] Seller ID:', updatedOrder.store.seller.id);
        console.log('📬 [WEBHOOK] Order:', updatedOrder.orderNumber, 'Valor:', updatedOrder.totalAmount);
        
        const { NotificationService } = await import('@/lib/services/notificationService');
        try {
          // Apenas disparar a URL cadastrada - sem enviar dados (Pushcut cobra para receber dados)
          await NotificationService.sendPushcut(updatedOrder.store.seller.id, 'approved');
          console.log('✅ [WEBHOOK] Notificação Pushcut approved disparada com sucesso');
        } catch (err) {
          console.error('❌ [WEBHOOK] Erro ao enviar Pushcut approved:', err);
        }
      } else {
        console.warn('⚠️ [WEBHOOK] Seller ID não encontrado para enviar notificação approved');
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
          return NextResponse.json(
            { success: true },
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
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
          return NextResponse.json(
            { success: true },
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
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

    } else if (
      paymentStatus.status === 'charged_back' ||
      (paymentStatus.statusDetail && String(paymentStatus.statusDetail).toLowerCase().includes('chargeback'))
    ) {
      console.log('⚠️ [WEBHOOK] Chargeback detectado. Atualizando pedido e disparando notificação...');
      // Atualiza o pedido como reembolsado para refletir o chargeback
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED'
        }
      });

      // Disparar notificação Pushcut de chargeback
      try {
        const sellerId = transaction.order.store.seller?.id;
        if (sellerId) {
          const { NotificationService } = await import('@/lib/services/notificationService');
          await NotificationService.sendPushcut(sellerId, 'chargeback');
          console.log('📬 [WEBHOOK] Notificação Pushcut chargeback disparada');
        } else {
          console.warn('⚠️ [WEBHOOK] Seller ID não encontrado para enviar notificação de chargeback');
        }
      } catch (err) {
        console.error('❌ [WEBHOOK] Erro ao disparar notificação de chargeback:', err);
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
    // Retornar 200 explicitamente com headers para evitar redirecionamentos
    return NextResponse.json(
      { success: true },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );

  } catch (error: unknown) {
    console.error('❌ [WEBHOOK] ========== ERRO GERAL ==========');
    console.error('❌ [WEBHOOK] Erro:', error);
    console.error('❌ [WEBHOOK] Message:', error instanceof Error ? error.message : 'N/A');
    console.error('❌ [WEBHOOK] Stack:', error instanceof Error ? error.stack : 'N/A');
    // Sempre retornar 200 para o Mercado Pago, mesmo em caso de erro
    // Isso evita que o MP tente reenviar o webhook repetidamente
    return NextResponse.json(
      { success: true },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  }
}

/**
 * Valida a assinatura do webhook do Mercado Pago usando HMAC-SHA256
 * 
 * O Mercado Pago envia a assinatura no header 'x-signature' no formato:
 * - sha256=hash_hex ou apenas hash_hex
 * 
 * A validação é feita calculando o HMAC-SHA256 do body raw (texto) usando o secret
 * e comparando com a assinatura recebida.
 * 
 * IMPORTANTE: O body deve ser o texto raw exatamente como recebido, não o objeto JSON parseado.
 * Isso garante que a validação seja feita sobre os mesmos bytes que o Mercado Pago assinou.
 * 
 * @param bodyText - Corpo da requisição como texto raw (string)
 * @param signature - Assinatura recebida no header 'x-signature'
 * @param secret - Secret configurado no ambiente (MERCADOPAGO_WEBHOOK_SECRET)
 * @returns true se a assinatura for válida, false caso contrário
 */
function validateWebhookSignature(bodyText: string, signature: string, secret: string): boolean {
  try {
    // Normalizar a assinatura recebida
    // O Mercado Pago pode enviar no formato "sha256=hash" ou apenas "hash"
    let normalizedSignature = signature.trim();
    if (normalizedSignature.startsWith('sha256=')) {
      normalizedSignature = normalizedSignature.substring(7).trim();
    }
    
    // Calcular HMAC-SHA256 do body raw
    // IMPORTANTE: Usar o body exatamente como recebido (texto), não o JSON parseado
    // Isso garante que estamos validando os mesmos bytes que o Mercado Pago assinou
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText, 'utf8')
      .digest('hex');
    
    // Comparar assinaturas usando comparação segura (timing-safe)
    // Isso previne timing attacks onde um atacante poderia descobrir a assinatura
    // comparando o tempo de resposta
    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(normalizedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
      
      if (!isValid) {
        console.error('❌ [WEBHOOK] Assinatura não confere:', {
          received: normalizedSignature.substring(0, 20) + '...',
          expected: expectedSignature.substring(0, 20) + '...',
          bodyLength: bodyText.length,
          signatureLength: normalizedSignature.length,
          expectedLength: expectedSignature.length
        });
      }
      
      return isValid;
    } catch (compareError) {
      // Se as assinaturas tiverem tamanhos diferentes, timingSafeEqual lança erro
      // Isso também indica assinatura inválida
      console.error('❌ [WEBHOOK] Erro ao comparar assinaturas (tamanhos diferentes?):', {
        receivedLength: normalizedSignature.length,
        expectedLength: expectedSignature.length,
        error: compareError instanceof Error ? compareError.message : compareError
      });
      return false;
    }
  } catch (error: unknown) {
    console.error('❌ [WEBHOOK] Erro na validação de assinatura:', error instanceof Error ? error.message : error);
    console.error('❌ [WEBHOOK] Stack:', error instanceof Error ? error.stack : 'N/A');
    // Em caso de erro na validação, rejeitar por segurança
    return false;
  }
}
