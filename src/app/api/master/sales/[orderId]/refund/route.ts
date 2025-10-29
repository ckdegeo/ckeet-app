import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de acesso é obrigatório' }, { status: 401 });
    }

    const accessToken = authHeader.substring(7);
    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }
    if (user.user_metadata?.user_type !== 'master') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { password } = await request.json().catch(() => ({ password: '' }));
    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
    }

    // Confirmação da senha do master via reautenticação
    const reauth = await supabase.auth.signInWithPassword({ email: user.email!, password });
    if (reauth.error) {
      return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
    }

    const { orderId } = await params;
    console.log('[master-refund] start', { orderId, email: user.email });
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          select: {
            id: true,
            sellerId: true,
          }
        },
        transactions: {
          where: { type: 'SALE', status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, mpPaymentId: true }
        }
      }
    });
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }
    if (order.paymentStatus !== 'PAID' && order.status !== 'PAID') {
      return NextResponse.json({ error: 'Somente pedidos pagos podem ser reembolsados' }, { status: 400 });
    }

    // Tenta reembolsar no provedor (Mercado Pago) se possível
    const paymentId = order.transactions?.[0]?.mpPaymentId;
    if (paymentId) {
      const sellerConfig = await prisma.sellerPaymentConfig.findFirst({
        where: { sellerId: order.store!.sellerId, provider: 'MERCADO_PAGO' },
        select: { accessToken: true }
      });
      if (!sellerConfig?.accessToken) {
        console.warn('[master-refund] seller access token missing');
      } else {
        try {
          const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sellerConfig.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          });
          if (!mpRes.ok) {
            const txt = await mpRes.text();
            console.error('[master-refund] MP refund failed', mpRes.status, txt);
            return NextResponse.json({ error: 'Falha ao reembolsar no provedor de pagamento' }, { status: 502 });
          }
        } catch (e) {
          console.error('[master-refund] MP refund error', e);
          return NextResponse.json({ error: 'Erro ao contatar provedor de pagamento' }, { status: 502 });
        }
      }
    } else {
      console.warn('[master-refund] mpPaymentId ausente para order', orderId);
    }

    // Atualiza status para REFUNDED e registra transação de reembolso
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' }
      });

      await tx.transaction.create({
        data: {
          type: 'REFUND',
          amount: -order.totalAmount,
          status: 'COMPLETED',
          description: `Reembolso efetuado pelo master`,
          sellerAmount: 0,
          platformAmount: 0,
          orderId: order.id,
          storeId: order.storeId,
        }
      });
    });

    console.log('[master-refund] success', { orderId });
    return NextResponse.json({ success: true, message: 'Reembolso processado com sucesso' });
  } catch (error) {
    console.error('Erro ao processar reembolso (master):', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}


