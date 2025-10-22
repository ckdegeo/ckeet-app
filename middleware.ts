import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
