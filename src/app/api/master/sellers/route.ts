import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

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

    if (user.user_metadata?.user_type !== 'master') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Buscar todos os sellers com suas lojas
    const sellers = await prisma.seller.findMany({
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            isActive: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Para cada seller, calcular métricas agregadas
    const sellersWithMetrics = await Promise.all(
      sellers.map(async (seller) => {
        const storeId = seller.store?.id;

        if (!storeId) {
          // Seller sem loja - retornar dados básicos (não conta como bloqueado)
          return {
            id: seller.id,
            nomeLoja: seller.store?.name || 'Sem loja',
            nomeSeller: seller.name || 'N/A',
            cpf: seller.cpf || 'N/A',
            email: seller.email,
            telefone: seller.phone || 'N/A',
            faturamentoBruto: 0,
            comissao: 0,
            quantidadeVendas: 0,
            dataCriacao: seller.createdAt.toISOString(),
            status: 'ativo', // Seller sem loja não é considerado bloqueado
            subdomain: seller.store?.subdomain || null,
          };
        }

        // Calcular métricas agregadas da loja (todas as transações)
        const metrics = await prisma.$queryRaw<{
          faturamento_bruto: number;
          comissao_plataforma: number;
          quantidade_vendas: number;
        }[]>`
          SELECT 
            COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t.amount ELSE 0 END), 0)::float AS faturamento_bruto,
            COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN t."platformAmount" ELSE 0 END), 0)::float AS comissao_plataforma,
            COUNT(CASE WHEN t.status = 'COMPLETED' AND t.type = 'SALE' THEN 1 END)::int AS quantidade_vendas
          FROM transactions t
          WHERE t."storeId" = ${storeId}
        `;

        const m = metrics[0] || {
          faturamento_bruto: 0,
          comissao_plataforma: 0,
          quantidade_vendas: 0
        };

        return {
          id: seller.id,
          nomeLoja: seller.store?.name || 'Sem loja',
          nomeSeller: seller.name || 'N/A',
          cpf: seller.cpf || 'N/A',
          email: seller.email,
          telefone: seller.phone || 'N/A',
          faturamentoBruto: Math.round(m.faturamento_bruto * 100) / 100,
          comissao: Math.round(m.comissao_plataforma * 100) / 100,
          quantidadeVendas: m.quantidade_vendas,
          dataCriacao: seller.createdAt.toISOString(),
          status: seller.store?.isActive ? 'ativo' : 'bloqueado',
          subdomain: seller.store?.subdomain || null,
        };
      })
    );

    // Calcular totais para os cards
    // Apenas sellers com loja cadastrada contam como "lojas"
    const sellersComLoja = sellersWithMetrics.filter(s => s.subdomain !== null);
    const lojasCadastradas = sellersComLoja.length;
    // Apenas lojas que existem E estão bloqueadas (não sellers sem loja)
    const lojasBloqueadas = sellersWithMetrics.filter(s => 
      s.subdomain !== null && s.status === 'bloqueado'
    ).length;

    return NextResponse.json({
      success: true,
      data: sellersWithMetrics,
      totals: {
        lojasCadastradas,
        lojasBloqueadas
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Erro ao buscar sellers:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

