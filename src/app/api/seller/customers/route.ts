import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

// Forçar revalidação a cada requisição (sem cache)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso é obrigatório' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    
    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    if (user.user_metadata?.user_type !== 'seller') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const sellerId = user.user_metadata?.seller_id || user.id;
    
    // Pegar parâmetros de data
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    // End date deve ser o FIM do dia (23:59:59)
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Start date deve ser o INICIO do dia (00:00:00)
    const startDate = startDateParam ? new Date(startDateParam) : new Date();
    startDate.setHours(0, 0, 0, 0);

    // Buscar clientes do seller dentro do período
    const customers = await prisma.customer.findMany({
      where: {
        sellerId: sellerId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            totalAmount: true
          }
        },
        purchases: {
          select: {
            id: true,
            deliveredContent: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatar dados dos clientes
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      name: customer.name || 'N/A',
      phone: customer.phone || 'N/A',
      status: customer.status,
      createdAt: customer.createdAt,
      totalOrders: customer.orders.length,
      totalPurchases: customer.purchases.length,
      totalSpent: customer.orders
        .filter(order => order.status === 'PAID')
        .reduce((sum, order) => sum + order.totalAmount, 0)
    }));

    return NextResponse.json({
      success: true,
      data: formattedCustomers,
      total: formattedCustomers.length
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

