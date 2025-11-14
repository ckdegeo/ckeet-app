/**
 * Cliente API que intercepta erros 401 e redireciona para login
 */

// Função para obter o tipo de usuário baseado na rota atual
function getUserTypeFromPath(): 'seller' | 'customer' | 'master' | null {
  if (typeof window === 'undefined') return null;
  
  const path = window.location.pathname;
  
  if (path.startsWith('/seller/')) return 'seller';
  if (path.startsWith('/shop/') || path.startsWith('/customer/')) return 'customer';
  if (path.startsWith('/master/')) return 'master';
  
  return null;
}

// Função para obter a URL de login baseada no tipo de usuário
function getLoginUrl(userType: 'seller' | 'customer' | 'master' | null): string {
  switch (userType) {
    case 'seller':
      return '/seller/auth/login';
    case 'customer':
      return '/shop/auth/login';
    case 'master':
      return '/master/auth/login';
    default:
      return '/seller/auth/login'; // Default
  }
}

// Função para limpar dados de autenticação
function clearAuthData(userType: 'seller' | 'customer' | 'master' | null) {
  if (typeof window === 'undefined') return;
  
  switch (userType) {
    case 'seller':
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('user_data');
      // Limpar cookies
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'expires_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      break;
    case 'customer':
      localStorage.removeItem('customer_access_token');
      localStorage.removeItem('customer_refresh_token');
      localStorage.removeItem('customer_expires_at');
      localStorage.removeItem('customer_user_data');
      // Limpar cookies
      document.cookie = 'customer_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'customer_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'customer_expires_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'customer_user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      break;
    case 'master':
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('user_data');
      // Limpar cookies
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'expires_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      break;
  }
}

// Função para redirecionar para login quando token expirar
function redirectToLogin(userType: 'seller' | 'customer' | 'master' | null) {
  if (typeof window === 'undefined') return;
  
  clearAuthData(userType);
  const loginUrl = getLoginUrl(userType);
  
  // Redirecionar para login
  window.location.href = loginUrl;
}

/**
 * Wrapper para fetch que intercepta erros 401 e redireciona para login
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const userType = getUserTypeFromPath();
  
  try {
    const response = await fetch(url, options);
    
    // Se receber 401 (Unauthorized), token expirou ou é inválido
    if (response.status === 401) {
      // Não redirecionar se já estiver na página de login
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.includes('/auth/login') || 
                          currentPath.includes('/auth/register');
      
      if (!isLoginPage) {
        redirectToLogin(userType);
      }
      
      // Retornar a resposta mesmo assim para que o código possa tratar
      return response;
    }
    
    return response;
  } catch (error) {
    // Em caso de erro de rede, apenas propagar
    throw error;
  }
}

/**
 * Hook para verificar se o token está expirado e redirecionar
 */
export function checkTokenExpiration() {
  if (typeof window === 'undefined') return;
  
  const userType = getUserTypeFromPath();
  if (!userType) return;
  
  let expiresAt: string | null = null;
  
  switch (userType) {
    case 'seller':
    case 'master':
      expiresAt = localStorage.getItem('expires_at');
      break;
    case 'customer':
      expiresAt = localStorage.getItem('customer_expires_at');
      break;
  }
  
  if (!expiresAt) {
    // Não tem token, verificar se não está em página pública
    const currentPath = window.location.pathname;
    const isPublicPage = currentPath.includes('/auth/login') || 
                        currentPath.includes('/auth/register') ||
                        currentPath.includes('/auth/forgot-password') ||
                        currentPath.includes('/auth/reset-password');
    
    if (!isPublicPage) {
      redirectToLogin(userType);
    }
    return;
  }
  
  const expirationTime = parseInt(expiresAt);
  const currentTime = Math.floor(Date.now() / 1000);
  
  if (currentTime >= expirationTime) {
    // Token expirado
    const currentPath = window.location.pathname;
    const isPublicPage = currentPath.includes('/auth/login') || 
                        currentPath.includes('/auth/register') ||
                        currentPath.includes('/auth/forgot-password') ||
                        currentPath.includes('/auth/reset-password');
    
    if (!isPublicPage) {
      redirectToLogin(userType);
    }
  }
}

