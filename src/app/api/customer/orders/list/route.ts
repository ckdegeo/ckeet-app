import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação do customer
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso é obrigatório' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    
    // Validar token com Supabase
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
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

    // Buscar todos os pedidos do customer com dados completos
    const orders = await prisma.order.findMany({
      where: { 
        customerId: customerId 
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            primaryColor: true,
            secondaryColor: true
          }
        },
        products: {
          include: {
            product: {
              include: {
                deliverables: true,
                stockLines: {
                  where: { 
                    isUsed: true,
                    isDeleted: true 
                  } as { isUsed: boolean; isDeleted: boolean }
                }
              }
            }
          }
        },
        purchases: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Montar dados para a tabela purchases
    const purchasesData = [];

    for (const order of orders) {
      for (const orderItem of order.products) {
        const product = orderItem.product;
        
        // Buscar purchase existente ou criar dados para exibição
        let purchase = order.purchases.find((p: { orderId: string }) => 
          p.orderId === order.id
        );

        // Se não existe purchase, criar dados baseados no orderItem
        if (!purchase) {
          purchase = {
            id: `temp-${order.id}-${orderItem.id}`,
            deliveredContent: null,
            stockLineId: null,
            downloadUrl: null,
            expiresAt: null,
            isDownloaded: false,
            downloadCount: 0,
            createdAt: order.createdAt,
            orderId: order.id,
            customerId: customerId
          };
        }

        // Buscar linha de estoque usada (se aplicável)
        const usedStockLine = product.stockLines.find((sl: { orderId: string | null; isDeleted: boolean }) => 
          sl.orderId === order.id && sl.isDeleted === true
        );

        // Buscar deliverables do produto
        const deliverables = product.deliverables || [];

        // Montar dados da compra
        const purchaseData = {
          id: purchase.id,
          orderNumber: order.orderNumber,
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          productDescription: product.description,
          productPrice: orderItem.price,
          quantity: orderItem.quantity,
          
          // Status do pedido
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          
          // Conteúdo entregue
          deliveredContent: purchase.deliveredContent || usedStockLine?.content || product.fixedContent,
          stockLineId: purchase.stockLineId || usedStockLine?.id,
          
          // Downloads
          downloadUrl: purchase.downloadUrl,
          deliverables: deliverables,
          expiresAt: purchase.expiresAt,
          isDownloaded: purchase.isDownloaded,
          downloadCount: purchase.downloadCount,
          
          // Informações da loja
          storeName: order.store.name,
          storeSubdomain: order.store.subdomain,
          storePrimaryColor: order.store.primaryColor,
          storeSecondaryColor: order.store.secondaryColor,
          
          // Datas
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          
          // Transações
          transactions: order.transactions,
          latestTransaction: order.transactions[0] || null,
          
          // Informações do customer
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          
          // Valores
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod
        };

        purchasesData.push(purchaseData);
      }
    }

    // Estatísticas
    const stats = {
      totalOrders: orders.length,
      totalPurchases: purchasesData.length,
      deliveredPurchases: purchasesData.filter(p => p.deliveredContent).length,
      pendingPurchases: purchasesData.filter(p => !p.deliveredContent && p.orderStatus === 'PAID').length,
      paidOrders: purchasesData.filter(p => p.orderStatus === 'PAID').length, // Adicionar contagem de pedidos pagos
      totalDownloads: purchasesData.reduce((sum, p) => sum + p.downloadCount, 0),
      totalAmount: purchasesData.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
    };

    return NextResponse.json({
      success: true,
      orders: orders,
      purchases: purchasesData,
      stats: stats,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pedidos do customer:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
