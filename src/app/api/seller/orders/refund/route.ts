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

    // Buscar order com produtos e transação MP
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        transactions: { orderBy: { createdAt: 'desc' }, take: 1 },
        store: { 
          include: { 
            seller: true
          }
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      }
    });
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar se o pedido está pago (verificar antes para evitar processamento desnecessário)
    if (order.status !== 'PAID') {
      return NextResponse.json({ error: 'Apenas pedidos pagos podem ser reembolsados' }, { status: 400 });
    }

    // Verificar se storeId existe
    const storeId = order.storeId || order.store?.id;
    if (!storeId) {
      return NextResponse.json({ error: 'Loja não encontrada para este pedido' }, { status: 404 });
    }

    // Verificar ANTES de qualquer outra coisa se algum produto é importado (do catálogo master)
    // Isso previne reembolsos mesmo se o pedido já foi reembolsado anteriormente
    if (order.products && order.products.length > 0) {
      // Buscar todos os ResellListings ativos da loja para verificar produtos importados
      const resellListings = await prisma.resellListing.findMany({
        where: {
          storeId: storeId,
          isActive: true
        },
        include: {
          sourceProduct: {
            select: {
              id: true,
              name: true,
              price: true
            }
          }
        }
      });

      // Criar um mapa de produtos importados: chave = nome|preço, valor = true
      const importedProductsMap = new Map<string, boolean>();
      resellListings.forEach(listing => {
        if (listing.sourceProduct) {
          const key = `${listing.sourceProduct.name}|${listing.sourceProduct.price}`;
          importedProductsMap.set(key, true);
        }
      });

      // Verificar se algum produto da ordem é importado
      for (const orderProduct of order.products) {
        const product = orderProduct.product;
        if (product) {
          const productKey = `${product.name}|${product.price || 0}`;
          if (importedProductsMap.has(productKey)) {
            return NextResponse.json({ 
              error: 'Produtos importados do catálogo não podem ser reembolsados. Apenas produtos próprios podem ser reembolsados.' 
            }, { status: 403 });
          }
        }
      }
    }

    const tx = order.transactions?.[0];
    if (!tx?.mpPaymentId) {
      return NextResponse.json({ error: 'Pagamento não encontrado para reembolso' }, { status: 400 });
    }

    // Obter sellerId correto
    const sellerId = order.store?.seller?.id;
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller não encontrado para este pedido' }, { status: 404 });
    }

    // Executar reembolso no MP
    const result = await MercadoPagoService.refundPayment(tx.mpPaymentId, sellerId);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Falha ao reembolsar' }, { status: 502 });
    }

    // Atualizar status da ordem e transação
    await prisma.order.update({ where: { id: order.id }, data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' } });
    await prisma.transaction.updateMany({ where: { orderId: order.id }, data: { status: 'FAILED', gatewayStatus: 'refunded' } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [SELLER-REFUND] Erro ao processar reembolso:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ [SELLER-REFUND] Detalhes do erro:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}


