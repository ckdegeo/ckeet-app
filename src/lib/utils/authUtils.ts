// Utilitários para gerenciar autenticação e tokens

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

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Salvar dados de autenticação no localStorage
export const saveAuthData = (user: UserData, tokens: AuthTokens) => {
  localStorage.setItem('user_data', JSON.stringify(user));
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
  localStorage.setItem('expires_at', tokens.expires_at.toString());
};

// Obter dados do usuário do localStorage
export const getUserData = (): UserData | null => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

// Obter access token do localStorage (client-side) ou headers (server-side)
export const getAccessToken = (request?: Request): string | null => {
  // Se estiver no servidor (API route), ler do header Authorization
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
  
  // Se estiver no cliente, usar localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  
  return null;
};

// Obter refresh token do localStorage
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

// Verificar se o token está expirado
export const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem('expires_at');
  if (!expiresAt) return true;
  
  const expirationTime = parseInt(expiresAt);
  const currentTime = Math.floor(Date.now() / 1000);
  
  return currentTime >= expirationTime;
};

// Verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  const userData = getUserData();
  const accessToken = getAccessToken();
  
  return !!(userData && accessToken && !isTokenExpired());
};

// Limpar dados de autenticação
export const clearAuthData = () => {
  localStorage.removeItem('user_data');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('expires_at');
  
  // Limpar qualquer cache de domínio para garantir verificação limpa
  // para a próxima conta que fizer login
  localStorage.removeItem('domain_cache');
};

// Verificar se é um tipo de usuário específico
export const isUserType = (userType: 'seller' | 'customer' | 'master'): boolean => {
  const userData = getUserData();
  return userData?.user_type === userType;
};

// Verificar se está autenticado e é master
export const isMasterAuthenticated = (): boolean => {
  return isAuthenticated() && isUserType('master');
};

// Renovar token usando refresh token (genérico)
export const refreshAuthToken = async (userType?: 'seller' | 'master'): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  // Determinar endpoint baseado no tipo de usuário
  const userData = getUserData();
  const endpoint = userType || userData?.user_type || 'seller';
  
  try {
    const response = await fetch(`/api/${endpoint}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const result = await response.json();
    
    if (result.tokens) {
      localStorage.setItem('access_token', result.tokens.access_token);
      localStorage.setItem('refresh_token', result.tokens.refresh_token);
      localStorage.setItem('expires_at', result.tokens.expires_at);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return false;
  }
};

// Fazer logout (genérico)
export const logout = async (userType?: 'seller' | 'master') => {
  const accessToken = getAccessToken();
  
  if (accessToken) {
    try {
      // Determinar endpoint baseado no tipo de usuário
      const userData = getUserData();
      const endpoint = userType || userData?.user_type || 'seller';
      
      await fetch(`/api/${endpoint}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
  
  clearAuthData();
};
