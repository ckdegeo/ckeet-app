import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/lib/services/mercadoPagoService';

/**
 * Callback do OAuth do Mercado Pago
 * GET /api/seller/mercadopago/callback?code=xxx&state=sellerId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // sellerId
    const error = searchParams.get('error');

    // Verificar se houve erro na autorização
    if (error) {
      console.error('Erro na autorização do Mercado Pago:', error);
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/seller/integrations?error=authorization_denied`
      );
    }

    // Verificar se temos o código e o sellerId
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/seller/integrations?error=missing_parameters`
      );
    }

    // Trocar código por tokens
    await MercadoPagoService.exchangeCodeForTokens(code, state);

    // Redirecionar para página de sucesso
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/seller/integrations?success=connected`
    );

  } catch (error) {
    console.error('Erro no callback do Mercado Pago:', error);
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/seller/integrations?error=connection_failed`
    );
  }
}
