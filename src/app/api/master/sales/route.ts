import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
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

    // Parâmetros de data opcionais
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = startDateParam ? new Date(startDateParam) : new Date('2000-01-01');
    startDate.setHours(0, 0, 0, 0);

    // Buscar pedidos (orders) de todas as lojas no período, com dados necessários
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            seller: { select: { id: true, name: true, email: true, phone: true } }
          }
        },
        products: {
          select: {
            product: {
              select: { 
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        transactions: {
          select: { type: true, status: true, platformAmount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Buscar todos os ResellListings de todas as lojas para determinar produtos importados
    const allStoreIds = [...new Set(orders.map(o => o.store?.id).filter(Boolean))] as string[];
    const resellListings = await prisma.resellListing.findMany({
      where: {
        storeId: { in: allStoreIds },
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

    // Buscar todos os produtos das lojas envolvidas
    const allProducts = await prisma.product.findMany({
      where: {
        storeId: { in: allStoreIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        storeId: true
      }
    });

    // Criar mapa de produtos importados por loja (storeId -> Set<productId>)
    const importedProductsByStore = new Map<string, Set<string>>();
    
    // Para cada ResellListing, encontrar o produto do seller correspondente
    resellListings.forEach(listing => {
      if (listing.sourceProduct && listing.storeId) {
        // Encontrar produtos do seller que correspondem ao sourceProduct (mesmo nome e preço)
        const matchingProducts = allProducts.filter(p => 
          p.storeId === listing.storeId &&
          p.name === listing.sourceProduct!.name &&
          p.price === listing.sourceProduct!.price
        );
        
        // Adicionar os IDs desses produtos ao Set de importados
        matchingProducts.forEach(product => {
          if (!importedProductsByStore.has(listing.storeId!)) {
            importedProductsByStore.set(listing.storeId!, new Set());
          }
          const storeSet = importedProductsByStore.get(listing.storeId!);
          storeSet?.add(product.id);
        });
      }
    });

    // Montar vendas e totais
    let faturamentoTotal = 0;
    let comissaoTotal = 0;
    let totalVendas = 0;
    let refundsTotal = 0;

    const sales = orders.map((o) => {
      const completedSalesTx = o.transactions.filter(t => t.status === 'COMPLETED' && t.type === 'SALE');
      const completedRefundsTx = o.transactions.filter(t => t.status === 'COMPLETED' && t.type === 'REFUND');

      const orderCommission = completedSalesTx.reduce((sum, t) => sum + (t.platformAmount || 0), 0);
      const orderRefunds = completedRefundsTx.reduce((sum, t) => sum + Math.abs(t.platformAmount || 0), 0);

      const isPaid = o.paymentStatus === 'PAID' || o.status === 'PAID' || completedSalesTx.length > 0;
      if (isPaid) {
        totalVendas += 1;
        faturamentoTotal += o.totalAmount;
        comissaoTotal += orderCommission;
      }
      refundsTotal += orderRefunds;

      const firstProduct = o.products?.[0]?.product;
      const firstProductName = firstProduct?.name || '-';
      
      // Determinar se o produto é importado (usando productId direto)
      let isImported = false;
      if (firstProduct?.id && o.store?.id) {
        const storeSet = importedProductsByStore.get(o.store.id);
        if (storeSet) {
          isImported = storeSet.has(firstProduct.id);
        }
      }
      
      // Calcular quanto o seller recebeu (valor total - comissão master)
      const sellerAmount = o.totalAmount - orderCommission;
      
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        productName: firstProductName,
        customerName: o.customerName || '-',
        customerEmail: o.customerEmail,
        createdAt: o.createdAt.toISOString(),
        status: o.status,
        paymentMethod: o.paymentMethod,
        amount: o.totalAmount,
        storeName: o.store?.name || '-',
        sellerName: o.store?.seller?.name || '-',
        sellerEmail: o.store?.seller?.email || '-',
        storeCommission: orderCommission,
        sellerAmount: sellerAmount, // Valor que o seller recebeu
        isImported: isImported // Se o produto é importado
      };
    });

    const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;

    return NextResponse.json({
      success: true,
      data: sales,
      totals: {
        totalVendas,
        faturamentoTotal,
        comissaoTotal,
        ticketMedio,
        refundsTotal
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Erro ao listar vendas (master):', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}


