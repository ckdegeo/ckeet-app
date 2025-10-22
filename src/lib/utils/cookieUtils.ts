// Utilitários para gerenciar cookies

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  user_type: 'seller' | 'customer' | 'master';
  seller_id?: string;
  customer_id?: string;
  master_id?: string;
  store_id?: string;
}

// Salvar dados de autenticação nos cookies
export const saveAuthCookies = (user: UserData, tokens: AuthTokens) => {
  const maxAge = tokens.expires_at - Math.floor(Date.now() / 1000);
  const refreshMaxAge = 7 * 24 * 60 * 60; // 7 dias

  // Access token (expira junto com o token)
  document.cookie = `access_token=${tokens.access_token}; path=/; max-age=${maxAge}; secure; samesite=strict`;
  
  // Refresh token (7 dias)
  document.cookie = `refresh_token=${tokens.refresh_token}; path=/; max-age=${refreshMaxAge}; secure; samesite=strict`;
  
  // Expiration time
  document.cookie = `expires_at=${tokens.expires_at}; path=/; max-age=${maxAge}; secure; samesite=strict`;
  
  // User data (7 dias)
  document.cookie = `user_data=${JSON.stringify(user)}; path=/; max-age=${refreshMaxAge}; secure; samesite=strict`;
};

// Obter cookie por nome
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Obter dados do usuário dos cookies
export const getUserDataFromCookie = (): UserData | null => {
  const userData = getCookie('user_data');
  return userData ? JSON.parse(userData) : null;
};

// Obter access token dos cookies
export const getAccessTokenFromCookie = (): string | null => {
  return getCookie('access_token');
};

// Obter refresh token dos cookies
export const getRefreshTokenFromCookie = (): string | null => {
  return getCookie('refresh_token');
};

// Verificar se o token está expirado (via cookies)
export const isTokenExpiredFromCookie = (): boolean => {
  const expiresAt = getCookie('expires_at');
  if (!expiresAt) return true;
  
  const expirationTime = parseInt(expiresAt);
  const currentTime = Math.floor(Date.now() / 1000);
  
  return currentTime >= expirationTime;
};

// Verificar se o usuário está autenticado (via cookies)
export const isAuthenticatedFromCookie = (): boolean => {
  const userData = getUserDataFromCookie();
  const accessToken = getAccessTokenFromCookie();
  
  return !!(userData && accessToken && !isTokenExpiredFromCookie());
};

// Limpar todos os cookies de autenticação
export const clearAuthCookies = () => {
  const cookies = ['access_token', 'refresh_token', 'expires_at', 'user_data'];
  
  cookies.forEach(cookie => {
    document.cookie = `${cookie}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
};

// Renovar cookies após refresh token
export const refreshAuthCookies = (tokens: AuthTokens) => {
  const userData = getUserDataFromCookie();
  if (userData) {
    saveAuthCookies(userData, tokens);
  }
};
