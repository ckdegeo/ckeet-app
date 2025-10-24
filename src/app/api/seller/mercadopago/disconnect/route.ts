import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

/**
 * Desconecta o seller do Mercado Pago
 * POST /api/seller/mercadopago/disconnect
 */
export async function POST(request: NextRequest) {
  try {
    const { sellerId } = await request.json();

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID é obrigatório' },
        { status: 400 }
      );
    }

    // Desconectar seller
    await MercadoPagoService.disconnectSeller(sellerId);

    return NextResponse.json({
      success: true,
      message: 'Desconectado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desconectar do Mercado Pago:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
