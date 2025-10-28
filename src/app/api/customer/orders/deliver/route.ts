import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log('📦 [DELIVER] Iniciando entrega para orderId:', orderId);

    // Verificar se é uma chamada interna (webhook) ou externa (customer)
    const authHeader = request.headers.get('authorization');
    const isInternalCall = !authHeader || !authHeader.startsWith('Bearer ');
    
    if (!isInternalCall) {
      // Se é chamada externa, verificar autenticação do customer
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
    }

    // Buscar order com todos os dados necessários
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        customer: true,
        products: {
          include: {
            product: {
              include: {
                stockLines: {
                  where: { isUsed: false },
                  take: 1
                },
                deliverables: true
              }
            }
          }
        },
        transactions: {
          where: { type: 'SALE', status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o pedido está pago
    if (order.status !== 'PAID' || order.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Pedido não está pago' },
        { status: 400 }
      );
    }

    // Verificar se já foi entregue
    const existingPurchases = await prisma.purchase.findMany({
      where: { orderId: order.id }
    });

    if (existingPurchases.length > 0) {
      return NextResponse.json(
        { error: 'Conteúdo já foi entregue' },
        { status: 400 }
      );
    }

    const deliveries = [];

    // Processar cada produto do pedido
    for (const orderItem of order.products) {
      const product = orderItem.product;
      let deliveredContent = null;
      let stockLineId = null;
      let downloadUrl = null;

      // Determinar conteúdo baseado no tipo de estoque
      if (product.stockType === 'LINE') {
        // Produto com estoque por linha - buscar linha disponível
        const availableStockLine = await prisma.stockLine.findFirst({
          where: {
            productId: product.id,
            isUsed: false,
            isDeleted: false
          } as { productId: string; isUsed: boolean; isDeleted: boolean },
          orderBy: { createdAt: 'asc' } // FIFO - First In, First Out
        });
        
        if (availableStockLine) {
          // SOFT DELETE: Marcar linha como usada e deletada (não pode ser reutilizada)
          await prisma.stockLine.update({
            where: { id: availableStockLine.id },
            data: {
              isUsed: true,
              isDeleted: true, // Soft delete - linha vendida não pode ser reutilizada
              usedAt: new Date(),
              orderId: order.id
            } as { isUsed: boolean; isDeleted: boolean; usedAt: Date; orderId: string }
          });

          deliveredContent = availableStockLine.content;
          stockLineId = availableStockLine.id;
        } else {
          return NextResponse.json(
            { error: `Estoque insuficiente para o produto: ${product.name}` },
            { status: 400 }
          );
        }
      } else if (product.stockType === 'FIXED') {
        // Produto com conteúdo fixo - sempre entrega o mesmo conteúdo
        if (!product.fixedContent || product.fixedContent.trim() === '') {
          return NextResponse.json(
            { error: `Produto ${product.name} não tem conteúdo fixo configurado` },
            { status: 400 }
          );
        }
        deliveredContent = product.fixedContent;
      } else if (product.stockType === 'KEYAUTH') {
        // Produto KeyAuth - gerar chave via API
        if (!product.keyAuthSellerKey || !product.keyAuthDays) {
          return NextResponse.json(
            { error: `Produto ${product.name} sem configuração KeyAuth` },
            { status: 400 }
          );
        }

        try {
          const url = `https://keyauth.win/api/seller/?sellerkey=${encodeURIComponent(product.keyAuthSellerKey)}&type=add&expiry=${encodeURIComponent(String(product.keyAuthDays))}&mask=******-******-******-******-******-******&level=1&amount=1&format=text`;
          const res = await fetch(url, { method: 'GET' });
          const text = await res.text();
          const generatedKey = text.trim();

          if (!res.ok || !generatedKey) {
            return NextResponse.json(
              { error: `Falha ao gerar chave KeyAuth para ${product.name}` },
              { status: 500 }
            );
          }

          deliveredContent = generatedKey;
        } catch (err) {
          return NextResponse.json(
            { error: `Erro ao gerar chave KeyAuth para ${product.name}` },
            { status: 500 }
          );
        }
      }

      // Buscar deliverables do produto
      if (product.deliverables && product.deliverables.length > 0) {
        // Usar o primeiro deliverable como download principal
        downloadUrl = product.deliverables[0].url;
      }

      // Criar purchase record
      const purchase = await prisma.purchase.create({
        data: {
          orderId: order.id,
          customerId: order.customerId!,
          deliveredContent: deliveredContent,
          stockLineId: stockLineId,
          downloadUrl: downloadUrl,
          expiresAt: null, // Sem expiração por padrão
          isDownloaded: false,
          downloadCount: 0
        }
      });

      deliveries.push({
        purchaseId: purchase.id,
        productName: product.name,
        deliveredContent: deliveredContent,
        downloadUrl: downloadUrl,
        deliverables: product.deliverables
      });
    }

    // Atualizar status do pedido para DELIVERED
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DELIVERED' }
    });

    return NextResponse.json({
      success: true,
      message: 'Produtos entregues com sucesso',
      deliveries: deliveries,
      orderId: order.id,
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error('Erro ao entregar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}