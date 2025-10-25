import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug OAuth - Testa a URL de autorização diretamente
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      return NextResponse.json({
        error: 'Variáveis de ambiente não configuradas',
        clientId: !!clientId,
        redirectUri: !!redirectUri
      }, { status: 500 });
    }
    
    // Gerar URL de autorização manual
    const authUrl = `https://auth.mercadopago.com.br/authorize?client_id=${clientId}&response_type=code&platform_id=mp&state=test_seller&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('🔍 [Debug OAuth] Client ID:', clientId);
    console.log('🔍 [Debug OAuth] Redirect URI:', redirectUri);
    console.log('🔍 [Debug OAuth] Auth URL:', authUrl);
    
    return NextResponse.json({
      success: true,
      clientId,
      redirectUri,
      authUrl,
      message: 'URL de autorização gerada com sucesso'
    });
    
  } catch (error) {
    console.error('🔍 [Debug OAuth] Erro:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
