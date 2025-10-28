import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const customerId = user.user_metadata?.customer_id;
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID não encontrado' },
        { status: 401 }
      );
    }

    // Verificar se o customer existe e não está banido
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer não encontrado' },
        { status: 404 }
      );
    }

    if (customer.status === 'BANNED') {
      return NextResponse.json(
        { error: 'Sua conta foi suspensa.' },
        { status: 403 }
      );
    }

    // Buscar orders pagas que não têm purchase
    const paidOrdersWithoutDelivery = await prisma.order.findMany({
      where: {
        customerId: customerId,
        status: 'PAID',
        paymentStatus: 'PAID'
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                stockLines: {
                  where: { isUsed: false, isDeleted: false },
                  orderBy: { createdAt: 'asc' },
                  take: 1
                },
                deliverables: true
              }
            }
          }
        }
      }
    });

    const results = [];

    // Para cada order paga sem delivery
    for (const order of paidOrdersWithoutDelivery) {
      // Verificar se já existe purchase
      const existingPurchases = await prisma.purchase.findMany({
        where: { orderId: order.id }
      });

      if (existingPurchases.length > 0) {
        continue; // Já foi entregue
      }

      // Tentar entregar
      try {
        const deliveries = [];

        for (const orderItem of order.products) {
          // Buscar produto completo
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

          if (!product) continue;

          let deliveredContent = null;
          let stockLineId = null;
          let downloadUrl = null;

          // Determinar conteúdo baseado no tipo de estoque
          if (product.stockType === 'LINE') {
            const availableStockLine = product.stockLines[0];
            
            if (availableStockLine) {
              // Marcar linha como usada
              await prisma.stockLine.update({
                where: { id: availableStockLine.id },
                data: {
                  isUsed: true,
                  isDeleted: true,
                  usedAt: new Date(),
                  orderId: order.id
                }
              });

              deliveredContent = availableStockLine.content;
              stockLineId = availableStockLine.id;
            }
          } else if (product.stockType === 'FIXED') {
            if (product.fixedContent && product.fixedContent.trim() !== '') {
              deliveredContent = product.fixedContent;
            }
          } else if (product.stockType === 'KEYAUTH') {
            // Verificar se já existe purchase para este produto (evitar gerar múltiplas keys)
            const existingPurchase = await prisma.purchase.findFirst({
              where: {
                orderId: order.id,
                // Verificar se há purchase com conteúdo KeyAuth para este pedido
                deliveredContent: {
                  not: null
                }
              }
            });

            if (existingPurchase) {
              console.log(`⚠️ [CHECK-DELIVERY] KeyAuth já entregue para pedido ${order.orderNumber}`);
              continue;
            }

            // Gerar chave via KeyAuth API apenas uma vez
            if (!product.keyAuthSellerKey || !product.keyAuthDays) {
              console.log(`⚠️ [CHECK-DELIVERY] Produto ${product.name} sem configuração KeyAuth`);
              continue;
            }

            try {
              console.log(`🔑 [CHECK-DELIVERY] Gerando chave KeyAuth para ${product.name} (pedido ${order.orderNumber})`);
              const url = `https://keyauth.win/api/seller/?sellerkey=${encodeURIComponent(product.keyAuthSellerKey)}&type=add&expiry=${encodeURIComponent(String(product.keyAuthDays))}&mask=******-******-******-******-******-******&level=1&amount=1&format=text`;
              const res = await fetch(url, { method: 'GET' });
              const text = await res.text();
              const generatedKey = text.trim();

              if (!res.ok || !generatedKey) {
                console.log(`❌ [CHECK-DELIVERY] Falha ao gerar chave KeyAuth para ${product.name}`);
                continue;
              }

              deliveredContent = generatedKey;
              console.log(`✅ [CHECK-DELIVERY] Chave KeyAuth gerada com sucesso: ${generatedKey.substring(0, 10)}...`);
            } catch (err) {
              console.log(`❌ [CHECK-DELIVERY] Erro ao gerar chave KeyAuth para ${product.name}:`, err);
              continue;
            }
          }

          // Buscar deliverables
          if (product.deliverables && product.deliverables.length > 0) {
            downloadUrl = product.deliverables[0].url;
          }

          // Só criar purchase se tiver conteúdo ou download para entregar
          if (!deliveredContent && !downloadUrl) {
            console.log(`⚠️ [CHECK-DELIVERY] Produto ${product.name} sem conteúdo disponível para entrega`);
            continue;
          }

          // Criar purchase
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

          deliveries.push({
            orderNumber: order.orderNumber,
            productName: product.name,
            purchaseId: purchase.id
          });
        }

        if (deliveries.length > 0) {
          results.push({
            success: true,
            message: 'Conteúdo entregue com sucesso',
            deliveries
          });
        }
      } catch (error) {
        results.push({
          success: false,
          orderNumber: order.orderNumber,
          error: error instanceof Error ? error.message : 'Erro ao entregar conteúdo'
        });
      }
    }

    return NextResponse.json({
      success: true,
      checked: paidOrdersWithoutDelivery.length,
      delivered: results.filter(r => r.success).length,
      results
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ [CHECK-DELIVERY] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

