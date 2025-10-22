import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, refreshAuthToken } from '@/lib/utils/authUtils';

// Middleware para proteger rotas que requerem autenticação
export function authGuard(request: NextRequest) {
  // Verificar se o usuário está autenticado
  if (!isAuthenticated()) {
    // Redirecionar para login se não estiver autenticado
    return NextResponse.redirect(new URL('/seller/auth/login', request.url));
  }

  return NextResponse.next();
}

// Middleware para verificar se o usuário já está logado (evitar acesso ao login/register)
export function guestGuard(request: NextRequest) {
  if (isAuthenticated()) {
    // Redirecionar para dashboard se já estiver logado
    return NextResponse.redirect(new URL('/seller/dashboard', request.url));
  }

  return NextResponse.next();
}

// Middleware para verificar tipo de usuário
export function userTypeGuard(request: NextRequest, allowedTypes: string[]) {
  if (!isAuthenticated()) {
    return NextResponse.redirect(new URL('/seller/auth/login', request.url));
  }

  // Aqui você pode adicionar lógica para verificar o tipo de usuário
  // Por enquanto, apenas verifica se está autenticado
  
  return NextResponse.next();
}
