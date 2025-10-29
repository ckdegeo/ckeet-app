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

    // Buscar todos os clientes de todas as lojas com dados completos
    const customers = await prisma.customer.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            store: {
              select: {
                id: true,
                name: true,
                subdomain: true,
                contactEmail: true
              }
            }
          }
        },
        orders: {
          select: {
            id: true,
            status: true,
            totalAmount: true
          }
        },
        purchases: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular métricas e formatar dados
    const data = customers.map((c) => {
      const totalPedidos = c.orders.length;
      const pedidosPagos = c.orders.filter(o => o.status === 'PAID').length;
      const totalGasto = c.orders
        .filter(o => o.status === 'PAID')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      return {
        id: c.id,
        nomeCliente: c.name || c.email,
        email: c.email,
        telefone: c.phone || 'N/A',
        status: c.status, // ACTIVE ou BANNED
        dataCriacao: c.createdAt.toISOString(),
        
        // Dados da loja
        lojaNome: c.seller?.store?.name || 'Sem loja',
        lojaSubdomain: c.seller?.store?.subdomain || null,
        lojaContactEmail: c.seller?.store?.contactEmail || null,
        
        // Dados do seller
        sellerId: c.seller?.id || null,
        sellerNome: c.seller?.name || 'N/A',
        sellerEmail: c.seller?.email || 'N/A',
        sellerTelefone: c.seller?.phone || 'N/A',
        
        // Métricas do customer
        totalPedidos,
        pedidosPagos,
        totalGasto,
        totalCompras: c.purchases.length
      };
    });

    // Calcular totais
    const totalClientes = data.length;
    const clientesAtivos = data.filter(c => c.status === 'ACTIVE').length;
    const clientesBanidos = data.filter(c => c.status === 'BANNED').length;

    return NextResponse.json({
      success: true,
      data,
      totals: {
        totalClientes,
        clientesAtivos,
        clientesBanidos
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Erro ao listar clientes (master):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


