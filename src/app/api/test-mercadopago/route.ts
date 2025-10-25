import { NextRequest, NextResponse } from 'next/server';

/**
 * Teste simples para verificar credenciais do Mercado Pago
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
    const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;
    
    console.log('🧪 [Test MP] Client ID:', clientId?.substring(0, 10) + '...');
    console.log('🧪 [Test MP] Client Secret:', clientSecret?.substring(0, 10) + '...');
    console.log('🧪 [Test MP] Redirect URI:', redirectUri);
    
    // Testar se conseguimos fazer uma requisição básica para o MP
    const testUrl = 'https://api.mercadopago.com/v1/payment_methods';
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_MASTER_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🧪 [Test MP] Test response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🧪 [Test MP] Payment methods count:', data.length);
    } else {
      const error = await response.text();
      console.error('🧪 [Test MP] Error:', error.substring(0, 200));
    }
    
    return NextResponse.json({
      success: true,
      clientId: clientId?.substring(0, 10) + '...',
      redirectUri,
      testStatus: response.status,
      message: 'Teste realizado com sucesso'
    });
    
  } catch (error) {
    console.error('🧪 [Test MP] Erro no teste:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
