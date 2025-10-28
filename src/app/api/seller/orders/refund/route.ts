import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de acesso é obrigatório' }, { status: 401 });
    }

    const { orderId, password } = await request.json();
    if (!orderId || !password) {
      return NextResponse.json({ error: 'orderId e password são obrigatórios' }, { status: 400 });
    }

    // Validar seller via Supabase
    const accessToken = authHeader.substring(7);
    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar senha
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });
    if (signInError || !signInData?.user) {
      return NextResponse.json({ error: 'Senha inválida' }, { status: 401 });
    }

    // Buscar order e última transação MP
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    if (order.status !== 'PAID') {
      return NextResponse.json({ error: 'Apenas pedidos pagos podem ser reembolsados' }, { status: 400 });
    }

    const tx = order.transactions?.[0];
    if (!tx?.mpPaymentId) {
      return NextResponse.json({ error: 'Pagamento não encontrado para reembolso' }, { status: 400 });
    }

    // Executar reembolso no MP
    const result = await MercadoPagoService.refundPayment(tx.mpPaymentId, order.storeId);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Falha ao reembolsar' }, { status: 502 });
    }

    // Atualizar status da ordem e transação
    await prisma.order.update({ where: { id: order.id }, data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' } });
    await prisma.transaction.updateMany({ where: { orderId: order.id }, data: { status: 'FAILED', gatewayStatus: 'refunded' } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}


