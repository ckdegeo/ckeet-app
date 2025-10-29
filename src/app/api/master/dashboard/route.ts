import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Period = '7d' | '30d' | '90d' | '12m';

function getDateRange(period: Period) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case '12m':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setDate(end.getDate() - 30);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
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

    if (user.user_metadata?.user_type !== 'master') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const periodParam = (url.searchParams.get('period') as Period) || '30d';
    const { start, end } = getDateRange(periodParam);

    // Métricas agregadas globais (TODAS as lojas - sem filtro de storeId)
    // Faturamento: somar de transactions (todas as lojas)
    const transactionsMetrics = await prisma.$queryRaw<{
      faturamento_bruto: number;
      faturamento_liquido_plataforma: number;
    }[]>`
      SELECT 
        COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t.amount ELSE 0 END), 0)::float AS faturamento_bruto,
        COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t."platformAmount" ELSE 0 END), 0)::float AS faturamento_liquido_plataforma
      FROM transactions t
      WHERE t."createdAt" >= ${start}::timestamp
        AND t."createdAt" <= ${end}::timestamp
    `;

    // Ordens: contar de orders (todas as lojas)
    const ordersMetrics = await prisma.$queryRaw<{
      pedidos_pagos: number;
      total_ordens: number;
    }[]>`
      SELECT 
        COALESCE(SUM(CASE WHEN o.status = 'PAID' THEN 1 ELSE 0 END), 0)::int AS pedidos_pagos,
        COALESCE(COUNT(o.id), 0)::int AS total_ordens
      FROM orders o
      WHERE o."createdAt" >= ${start}::timestamp
        AND o."createdAt" <= ${end}::timestamp
    `;

    const tx = transactionsMetrics[0] || {
      faturamento_bruto: 0,
      faturamento_liquido_plataforma: 0
    };

    const ord = ordersMetrics[0] || {
      pedidos_pagos: 0,
      total_ordens: 0
    };

    const m = {
      faturamento_bruto: tx.faturamento_bruto,
      faturamento_liquido_plataforma: tx.faturamento_liquido_plataforma,
      pedidos_pagos: ord.pedidos_pagos,
      total_ordens: ord.total_ordens
    };

    // Gráfico diário do líquido (platformAmount) - TODAS as lojas (sem filtro de storeId)
    const chartRows = await prisma.$queryRaw<{
      data: string;
      liquido_dia: number;
    }[]>`
      SELECT 
        DATE(t."createdAt")::text AS data,
        COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t."platformAmount" ELSE 0 END), 0)::float AS liquido_dia
      FROM transactions t
      WHERE t."createdAt" >= ${start}::timestamp
        AND t."createdAt" <= ${end}::timestamp
        AND t.status = 'COMPLETED'
        AND t.type = 'SALE'
      GROUP BY DATE(t."createdAt")
      ORDER BY data ASC
    `;

    const chart = chartRows.map(r => ({
      name: new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      faturamento: Math.round(r.liquido_dia * 100) / 100
    }));

    return NextResponse.json({
      success: true,
      data: {
        faturamentoBruto: Math.round(m.faturamento_bruto * 100) / 100,
        faturamentoLiquido: Math.round(m.faturamento_liquido_plataforma * 100) / 100,
        totalPagos: m.pedidos_pagos,
        totalOrdens: m.total_ordens,
        chart
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Erro ao carregar dashboard master:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}


