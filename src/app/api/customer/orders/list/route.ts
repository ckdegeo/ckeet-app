import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Verificar se o customer está banido
    if (customer.status === 'BANNED') {
      return NextResponse.json(
        { error: 'Sua conta foi suspensa. Não é possível acessar pedidos.' },
        { status: 403 }
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
      pendingPurchases: purchasesData.filter(p => !p.deliveredContent && p.paymentStatus === 'PAID').length,
      paidOrders: purchasesData.filter(p => p.paymentStatus === 'PAID').length, // Contagem de pedidos pagos baseada no paymentStatus
      totalDownloads: purchasesData.reduce((sum, p) => sum + p.downloadCount, 0),
      totalAmount: purchasesData.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
    };

    const responseData = {
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
    };

    // Gerar ETag baseado no hash dos dados
    const dataString = JSON.stringify(responseData);
    const etag = crypto.createHash('md5').update(dataString).digest('hex');

    // Verificar se o cliente já tem a versão mais recente
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === `"${etag}"`) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': `"${etag}"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
    }

    return NextResponse.json(responseData, {
      headers: {
        'ETag': `"${etag}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
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
