import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionStatus, TransactionType, CustomerStatus } from '@prisma/client';

// Cache simples em memória (pode ser melhorado com Redis em produção)
let cachedStats: {
  totalRevenue: string;
  totalStores: string;
  totalCustomers: string;
  lastUpdate: number;
} | null = null;

const CACHE_DURATION = 60000; // 1 minuto em cache

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    
    // Verificar cache
    if (cachedStats && (now - cachedStats.lastUpdate) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: {
          totalRevenue: cachedStats.totalRevenue,
          totalStores: cachedStats.totalStores,
          totalCustomers: cachedStats.totalCustomers
        }
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      });
    }

    // Buscar dados agregados do banco
    const [revenueResult, storesCount, customersCount] = await Promise.all([
      // Total faturado (somando apenas transações completadas do tipo SALE)
      prisma.transaction.aggregate({
        where: {
          status: TransactionStatus.COMPLETED,
          type: TransactionType.SALE
        },
        _sum: {
          amount: true
        }
      }),
      // Total de lojas ativas
      prisma.store.count({
        where: {
          isActive: true
        }
      }),
      // Total de customers ativos
      prisma.customer.count({
        where: {
          status: CustomerStatus.ACTIVE
        }
      })
    ]);

    // Formatar faturamento
    const totalAmount = revenueResult._sum.amount || 0;
    let formattedRevenue = 'R$ 0';
    
    if (totalAmount >= 1000000) {
      formattedRevenue = `R$ ${(totalAmount / 1000000).toFixed(1)}M`;
    } else if (totalAmount >= 1000) {
      formattedRevenue = `R$ ${(totalAmount / 1000).toFixed(0)}K`;
    } else {
      formattedRevenue = `R$ ${totalAmount.toFixed(0)}`;
    }

    // Formatar número de lojas
    const formattedStores = storesCount >= 1000 
      ? `${(storesCount / 1000).toFixed(0)}K+`
      : `${storesCount}+`;

    // Formatar número de customers
    const formattedCustomers = customersCount >= 1000
      ? `${(customersCount / 1000).toFixed(0)}K+`
      : `${customersCount}+`;

    // Atualizar cache
    cachedStats = {
      totalRevenue: formattedRevenue,
      totalStores: formattedStores,
      totalCustomers: formattedCustomers,
      lastUpdate: now
    };

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: formattedRevenue,
        totalStores: formattedStores,
        totalCustomers: formattedCustomers
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas públicas:', error);
    
    // Retornar dados padrão em caso de erro (não expor erro interno)
    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: 'R$ 0',
        totalStores: '0+',
        totalCustomers: '0+'
      }
    }, {
      status: 200, // Sempre retornar 200 para não quebrar a UI
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  }
}

