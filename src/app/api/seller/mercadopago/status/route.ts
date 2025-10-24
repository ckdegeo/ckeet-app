import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

/**
 * Retorna o status da conexão do seller com o Mercado Pago
 * GET /api/seller/mercadopago/status?sellerId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json(
        { 
          connected: false,
          status: 'DISCONNECTED',
          message: 'Seller ID não fornecido'
        },
        { status: 400 }
      );
    }

    // Buscar configuração do seller
    const config = await MercadoPagoService.getSellerCredentials(sellerId);

    if (!config) {
      return NextResponse.json({
        connected: false,
        status: 'DISCONNECTED',
        message: 'Seller não conectado ao Mercado Pago'
      });
    }

    // Verificar se o token expirou
    const isExpired = config.expiresAt && new Date() > config.expiresAt;
    
    return NextResponse.json({
      connected: config.status === 'CONNECTED' && !isExpired,
      status: isExpired ? 'EXPIRED' : config.status,
      lastSync: config.lastSyncAt,
      error: config.errorMessage,
      userId: config.userId,
    });

  } catch (error) {
    console.error('Erro ao buscar status do Mercado Pago:', error);
    
    return NextResponse.json(
      { 
        connected: false,
        status: 'ERROR',
        message: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
