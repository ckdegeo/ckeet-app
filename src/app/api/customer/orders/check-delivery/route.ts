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
            // Ainda não implementado
            continue;
          }

          // Buscar deliverables
          if (product.deliverables && product.deliverables.length > 0) {
            downloadUrl = product.deliverables[0].url;
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

