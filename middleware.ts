import { NextRequest, NextResponse } from 'next/server';
import { storeSetupGuard } from '@/lib/middleware/storeSetupGuard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A verificação de domínio de loja agora é feita client-side no page.tsx
  // Aqui mantemos apenas as verificações de autenticação e rotas protegidas

  // Rotas que NÃO precisam de autenticação
  const publicRoutes = [
    '/seller/auth/login',
    '/seller/auth/register',
    '/seller/auth/forgot-password',
    '/seller/auth/reset-password',
  ];

  // Rotas públicas do master
  const masterPublicRoutes = [
    '/master/auth/login',
  ];

  // Verificar se é uma rota de master
  if (pathname.startsWith('/master/')) {
    // Se for uma rota pública, permitir acesso
    if (masterPublicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Para todas as outras rotas de master, verificar autenticação
    const accessToken = request.cookies.get('access_token')?.value;
    const userData = request.cookies.get('user_data')?.value;

    if (!accessToken || !userData) {
      // Redirecionar para login se não estiver autenticado
      return NextResponse.redirect(new URL('/master/auth/login', request.url));
    }

    // Verificar se o token não expirou
    const expiresAt = request.cookies.get('expires_at')?.value;
    if (expiresAt) {
      const expirationTime = parseInt(expiresAt);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime >= expirationTime) {
        // Token expirado, redirecionar para login
        return NextResponse.redirect(new URL('/master/auth/login', request.url));
      }
    }

    // Verificar se é um master (verificar user_type nos cookies)
    try {
      const userDataParsed = JSON.parse(userData);
      if (userDataParsed.user_type !== 'master') {
        // Não é master, redirecionar para login
        return NextResponse.redirect(new URL('/master/auth/login', request.url));
      }
    } catch (error) {
      // Erro ao parsear user_data, redirecionar para login
      return NextResponse.redirect(new URL('/master/auth/login', request.url));
    }

    return NextResponse.next();
  }

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
