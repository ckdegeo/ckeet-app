import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

/**
 * Inicia o fluxo OAuth do Mercado Pago
 * GET /api/seller/mercadopago/connect?sellerId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID é obrigatório' },
        { status: 400 }
      );
    }

    // Gerar URL de autorização e redirecionar para o Mercado Pago
    const authUrl = MercadoPagoService.getOAuthRedirectUrl(sellerId);
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('Erro ao iniciar OAuth do Mercado Pago:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
