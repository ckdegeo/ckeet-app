import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

interface DashboardMetrics {
  faturamento_bruto: number;
  faturamento_liquido: number;
  qtd_vendas: number;
}

interface OrderStatusCount {
  status: string;
  count: number;
}

interface ChartData {
  data: string;
  faturamento_dia: number;
}

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
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const store = await prisma.store.findUnique({
      where: { sellerId }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    // Query única para métricas de transações
    const metricsResult = await prisma.$queryRaw<DashboardMetrics[]>`
      SELECT 
        COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t.amount ELSE 0 END), 0)::float as faturamento_bruto,
        COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t."sellerAmount" ELSE 0 END), 0)::float as faturamento_liquido,
        COUNT(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN 1 END)::int as qtd_vendas
      FROM transactions t
      WHERE t."storeId" = ${store.id}
        AND t."createdAt" >= ${startDate}::timestamp
        AND t."createdAt" <= ${endDate}::timestamp
    `;

    // Query para status de ordens
    const orderStatusResult = await prisma.$queryRaw<OrderStatusCount[]>`
      SELECT 
        status,
        COUNT(*)::int as count
      FROM orders
      WHERE "storeId" = ${store.id}
        AND "createdAt" >= ${startDate}::timestamp
        AND "createdAt" <= ${endDate}::timestamp
      GROUP BY status
    `;

    // Query para dados do gráfico (últimos 30 dias)
    const chartDataResult = await prisma.$queryRaw<ChartData[]>`
      SELECT 
        DATE(t."createdAt")::text as data,
        COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t."sellerAmount" ELSE 0 END), 0)::float as faturamento_dia
      FROM transactions t
      WHERE t."storeId" = ${store.id}
        AND t."createdAt" >= ${startDate}::timestamp
        AND t."createdAt" <= ${endDate}::timestamp
        AND t.status = 'COMPLETED'
        AND t.type = 'SALE'
      GROUP BY DATE(t."createdAt")
      ORDER BY data ASC
    `;

    const metrics = metricsResult[0] || {
      faturamento_bruto: 0,
      faturamento_liquido: 0,
      qtd_vendas: 0
    };

    const totalOrders = orderStatusResult.reduce((acc, item) => acc + item.count, 0);
    const pendingOrders = orderStatusResult.find(o => o.status === 'PENDING')?.count || 0;
    const approvedOrders = orderStatusResult.find(o => o.status === 'PAID')?.count || 0;

    // Formatar dados do gráfico
    const chartData = chartDataResult.map(item => ({
      name: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      faturamento: Math.round(item.faturamento_dia * 100) / 100
    }));

    // Calcular período anterior para comparação
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = startDate;

    const previousMetricsResult = await prisma.$queryRaw<DashboardMetrics[]>`
      SELECT 
        COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t."sellerAmount" ELSE 0 END), 0)::float as faturamento_liquido
      FROM transactions t
      WHERE t."storeId" = ${store.id}
        AND t."createdAt" >= ${previousStartDate}::timestamp
        AND t."createdAt" < ${previousEndDate}::timestamp
    `;

    const previousLiquido = previousMetricsResult[0]?.faturamento_liquido || 0;
    const liquidChange = previousLiquido > 0 
      ? ((metrics.faturamento_liquido - previousLiquido) / previousLiquido) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        faturamentoBruto: Math.round(metrics.faturamento_bruto * 100) / 100,
        faturamentoLiquido: Math.round(metrics.faturamento_liquido * 100) / 100,
        qtdVendas: metrics.qtd_vendas,
        ordens: { 
          total: totalOrders, 
          pendentes: pendingOrders, 
          aprovadas: approvedOrders 
        },
        chart: chartData,
        change: Math.round(liquidChange * 10) / 10
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados da dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

