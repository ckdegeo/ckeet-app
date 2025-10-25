import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar assinatura do webhook (se configurada)
    const signature = request.headers.get('x-signature');
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const isValid = validateWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('❌ [WEBHOOK] Assinatura inválida');
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
      console.log('✅ [WEBHOOK] Assinatura válida');
    }
    
    // Verificar se é um webhook de pagamento
    if (body.type !== 'payment') {
      return NextResponse.json({ success: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ success: true });
    }

    console.log(`🔔 Webhook Mercado Pago - Payment ID: ${paymentId}`);

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
      console.log(`❌ Transação não encontrada para payment ID: ${paymentId}`);
      return NextResponse.json({ success: true });
    }

    // Buscar configuração do Mercado Pago
    const mpConfig = transaction.order.store.seller?.paymentConfigs?.[0];
    if (!mpConfig || !mpConfig.accessToken) {
      console.log(`❌ Configuração MP não encontrada para order: ${transaction.order.id}`);
      return NextResponse.json({ success: true });
    }

    // Consultar status atualizado no Mercado Pago
    const paymentStatus = await MercadoPagoService.getPaymentStatus({
      paymentId,
      accessToken: mpConfig.accessToken
    });

    if (!paymentStatus.success) {
      console.log(`❌ Erro ao consultar status do pagamento: ${paymentStatus.error}`);
      return NextResponse.json({ success: true });
    }

    console.log(`📊 Status do pagamento ${paymentId}: ${paymentStatus.status}`);

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

      console.log(`✅ Order ${transaction.order.orderNumber} marcado como pago`);

      // Entregar conteúdo automaticamente
      try {
        const deliverResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/customer/orders/deliver`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mpConfig.accessToken}` // Usar token do seller para autenticação interna
          },
          body: JSON.stringify({ orderId: transaction.orderId })
        });

        if (deliverResponse.ok) {
          console.log(`📦 Conteúdo entregue automaticamente para order ${transaction.order.orderNumber}`);
        } else {
          console.log(`⚠️ Erro ao entregar conteúdo automaticamente para order ${transaction.order.orderNumber}`);
        }
      } catch (deliverError) {
        console.error(`❌ Erro ao entregar conteúdo:`, deliverError);
      }

    } else if (paymentStatus.status === 'rejected') {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      });

      console.log(`❌ Order ${transaction.order.orderNumber} cancelado`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro no webhook Mercado Pago:', error);
    return NextResponse.json({ success: true }); // Sempre retornar sucesso para o MP
  }
}

// Função para validar assinatura do webhook
function validateWebhookSignature(body: unknown, signature: string, secret: string): boolean {
  try {
    // Implementar validação de assinatura conforme documentação do Mercado Pago
    // Por enquanto, retorna true (implementar validação real depois)
    console.log('🔐 [WEBHOOK] Validando assinatura...');
    
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
  } catch (error) {
    console.error('❌ [WEBHOOK] Erro na validação de assinatura:', error);
    return false;
  }
}
