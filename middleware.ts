import { NextRequest, NextResponse } from 'next/server';
import { storeSetupGuard } from '@/lib/middleware/storeSetupGuard';
import { RESERVED_SUBDOMAINS } from '@/lib/config/domains';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Debug logs
  console.log('🔍 Middleware Debug:', {
    hostname,
    pathname,
    subdomain: hostname.split('.')[0]
  });

  // Extrair subdomínio
  const subdomain = hostname.split('.')[0];
  
  // Ignorar em localhost/desenvolvimento
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  
  // Verificar se é um subdomínio de loja (não é um subdomínio reservado)
  const isStorefrontDomain = 
    !isLocalhost &&
    !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase()) &&
    !pathname.startsWith('/seller/') &&
    !pathname.startsWith('/master/') &&
    !pathname.startsWith('/customer/') &&
    !pathname.startsWith('/api/') &&
    subdomain !== 'www' &&
    subdomain !== 'ckeet' &&
    hostname.split('.').length > 1; // Garantir que tem pelo menos um ponto (tem subdomínio)

  console.log('🏪 É domínio de loja?', isStorefrontDomain);

  // Se for um subdomínio de loja, redirecionar para /shop
  if (isStorefrontDomain) {
    // Se já está em /shop, permitir acesso
    if (pathname.startsWith('/shop')) {
      console.log('✅ Já está em /shop, permitindo acesso');
      return NextResponse.next();
    }
    
    console.log('🔀 Redirecionando para /shop');
    // Qualquer outra rota em subdomínio de loja redireciona para /shop
    return NextResponse.redirect(new URL('/shop', request.url));
  }

  // Rotas que NÃO precisam de autenticação
  const publicRoutes = [
    '/seller/auth/login',
    '/seller/auth/register',
    '/seller/auth/forgot-password',
    '/seller/auth/reset-password',
  ];

  // Verificar se é uma rota de seller
  if (pathname.startsWith('/seller/')) {
    // Se for uma rota pública, permitir acesso
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Para todas as outras rotas de seller, verificar autenticação
    const accessToken = request.cookies.get('access_token')?.value;
    const userData = request.cookies.get('user_data')?.value;

    if (!accessToken || !userData) {
      // Redirecionar para login se não estiver autenticado
      return NextResponse.redirect(new URL('/seller/auth/login', request.url));
    }

    // Verificar se o token não expirou
    const expiresAt = request.cookies.get('expires_at')?.value;
    if (expiresAt) {
      const expirationTime = parseInt(expiresAt);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime >= expirationTime) {
        // Token expirado, redirecionar para login
        return NextResponse.redirect(new URL('/seller/auth/login', request.url));
      }
    }

    // Verificar se a loja está completa usando o guard
    return storeSetupGuard(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)',
  ],
};
