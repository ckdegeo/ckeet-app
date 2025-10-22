import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { 
  checkSellerStoreCompletion, 
  isProtectedSellerRoute, 
  STORE_SETUP_ROUTE 
} from '@/lib/utils/storeValidation';

/**
 * Middleware para verificar se o seller completou a configuração da loja
 * Redireciona para /seller/store se a loja não estiver completa
 */
export async function storeSetupGuard(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  console.log(`[StoreSetupGuard] Verificando rota: ${pathname}`);
  
  // Verificar se é uma rota protegida que exige loja completa
  if (!isProtectedSellerRoute(pathname)) {
    console.log(`[StoreSetupGuard] Rota não protegida: ${pathname}`);
    return null; // Não é rota protegida, continuar
  }

  // Se já está na página de configuração da loja, permitir acesso
  if (pathname === STORE_SETUP_ROUTE) {
    console.log(`[StoreSetupGuard] Já está na página de configuração: ${pathname}`);
    return null;
  }

  try {
    // Obter token de autorização
    const authToken = request.cookies.get('access_token')?.value || 
                     request.headers.get('authorization')?.replace('Bearer ', '');

    if (!authToken) {
      console.log(`[StoreSetupGuard] Sem token de acesso para: ${pathname}`);
      // Sem token, redirecionar para login
      const loginUrl = new URL('/seller/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar se o token é válido e obter usuário
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);

    if (authError || !user) {
      console.log(`[StoreSetupGuard] Token inválido para: ${pathname}`, authError);
      // Token inválido, redirecionar para login
      const loginUrl = new URL('/seller/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar se é um seller
    if (user.user_metadata?.user_type !== 'seller') {
      console.log(`[StoreSetupGuard] Usuário não é seller para: ${pathname}`);
      // Não é seller, redirecionar para login
      const loginUrl = new URL('/seller/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    console.log(`[StoreSetupGuard] Verificando completude da loja para seller: ${user.id}`);
    
    // Verificar se a loja está completa
    const storeStatus = await checkSellerStoreCompletion(user.id);
    
    console.log(`[StoreSetupGuard] Status da loja:`, {
      isComplete: storeStatus.isComplete,
      missingFields: storeStatus.missingFields,
      completionPercentage: storeStatus.completionPercentage
    });
    
    if (!storeStatus.isComplete) {
      console.log(`[StoreSetupGuard] Loja incompleta, redirecionando para configuração`);
      // Loja não está completa, redirecionar para configuração
      const storeSetupUrl = new URL(STORE_SETUP_ROUTE, request.url);
      
      // Adicionar parâmetro para mostrar toast de aviso
      storeSetupUrl.searchParams.set('incomplete', 'true');
      
      return NextResponse.redirect(storeSetupUrl);
    }

    console.log(`[StoreSetupGuard] Loja completa, permitindo acesso a: ${pathname}`);
    // Loja está completa, continuar
    return null;

  } catch (error) {
    console.error('Erro no middleware de verificação da loja:', error);
    
    // Em caso de erro, redirecionar para configuração da loja por segurança
    const storeSetupUrl = new URL(STORE_SETUP_ROUTE, request.url);
    storeSetupUrl.searchParams.set('error', 'verification_failed');
    
    return NextResponse.redirect(storeSetupUrl);
  }
}

/**
 * Verificar se o seller pode acessar outras rotas (loja completa)
 */
export async function canAccessSellerRoutes(sellerId: string): Promise<boolean> {
  try {
    const storeStatus = await checkSellerStoreCompletion(sellerId);
    return storeStatus.isComplete;
  } catch (error) {
    console.error('Erro ao verificar acesso às rotas do seller:', error);
    return false;
  }
}
