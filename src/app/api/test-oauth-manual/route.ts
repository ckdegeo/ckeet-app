import { NextRequest, NextResponse } from 'next/server';

/**
 * Teste manual do OAuth - Simula exatamente o que fazemos no callback
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
    const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({
        error: 'Variáveis de ambiente não configuradas'
      }, { status: 500 });
    }
    
    // Simular um código de autorização (válido por alguns minutos)
    const testCode = 'TG-test-code-123456';
    
    console.log('🧪 [Test OAuth Manual] Iniciando teste...');
    console.log('🧪 [Test OAuth Manual] Client ID:', clientId);
    console.log('🧪 [Test OAuth Manual] Redirect URI:', redirectUri);
    console.log('🧪 [Test OAuth Manual] Test Code:', testCode);
    
    // Testar diferentes endpoints OAuth
    const endpoints = [
      'https://auth.mercadopago.com.br/oauth/token',
      'https://api.mercadopago.com/oauth/token',
      'https://api.mercadopago.com/oauth/token'
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 [Test OAuth Manual] Testando: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: testCode,
            redirect_uri: redirectUri,
          }),
        });
        
        console.log(`🧪 [Test OAuth Manual] Status: ${response.status}`);
        
        const responseText = await response.text();
        console.log(`🧪 [Test OAuth Manual] Response: ${responseText.substring(0, 200)}`);
        
        results.push({
          endpoint,
          status: response.status,
          success: response.ok,
          response: responseText.substring(0, 200)
        });
        
      } catch (error) {
        console.error(`🧪 [Test OAuth Manual] Erro em ${endpoint}:`, error);
        results.push({
          endpoint,
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      message: 'Teste OAuth manual realizado'
    });
    
  } catch (error) {
    console.error('🧪 [Test OAuth Manual] Erro geral:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
