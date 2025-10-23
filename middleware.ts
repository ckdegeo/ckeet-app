import { NextRequest, NextResponse } from 'next/server';
import { storeSetupGuard } from '@/lib/middleware/storeSetupGuard';
import { RESERVED_SUBDOMAINS } from '@/lib/config/domains';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extrair subdomínio
  const subdomain = hostname.split('.')[0];
  
  console.log('🔍 Middleware - Hostname:', hostname);
  console.log('🔍 Middleware - Subdomain:', subdomain);
  console.log('🔍 Middleware - Pathname:', pathname);
  
  // Verificar se é um subdomínio de loja (não é um subdomínio reservado)
  const isStorefrontDomain = 
    !RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase()) &&
    !pathname.startsWith('/seller/') &&
    !pathname.startsWith('/master/') &&
    !pathname.startsWith('/customer/') &&
    !pathname.startsWith('/api/') &&
    subdomain !== 'localhost' &&
    subdomain !== 'localhost:3000' &&
    subdomain !== 'www' &&
    subdomain !== 'ckeet';

  console.log('🏪 Is Storefront Domain:', isStorefrontDomain);

  // Se for um subdomínio de loja, permitir acesso às rotas da storefront
  if (isStorefrontDomain) {
    console.log('🔄 Redirecting to /shop');
    // Permitir acesso direto às rotas da storefront
    if (pathname === '/' || pathname.startsWith('/shop')) {
      return NextResponse.next();
    }
    
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
