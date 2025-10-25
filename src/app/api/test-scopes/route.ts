import { NextRequest, NextResponse } from 'next/server';

/**
 * Teste para verificar se a aplicação tem os scopes necessários
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_MASTER_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json({
        error: 'Access token não configurado'
      }, { status: 500 });
    }
    
    // Testar diferentes endpoints para verificar permissões
    const tests = [
      {
        name: 'Payment Methods',
        url: 'https://api.mercadopago.com/v1/payment_methods',
        method: 'GET'
      },
      {
        name: 'User Info',
        url: 'https://api.mercadopago.com/users/me',
        method: 'GET'
      },
      {
        name: 'OAuth Info',
        url: 'https://api.mercadopago.com/oauth/token',
        method: 'POST'
      }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`🧪 [Test Scopes] Testando: ${test.name}`);
        
        const response = await fetch(test.url, {
          method: test.method,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`🧪 [Test Scopes] ${test.name} - Status: ${response.status}`);
        
        results.push({
          name: test.name,
          status: response.status,
          success: response.ok,
          url: test.url
        });
        
      } catch (error) {
        console.error(`🧪 [Test Scopes] Erro em ${test.name}:`, error);
        results.push({
          name: test.name,
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      accessToken: accessToken.substring(0, 20) + '...',
      tests: results,
      message: 'Teste de scopes realizado'
    });
    
  } catch (error) {
    console.error('🧪 [Test Scopes] Erro geral:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
