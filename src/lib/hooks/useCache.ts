import { useState, useEffect, useRef } from 'react';

interface CacheOptions {
  key: string;
  duration?: number; // em milissegundos, padrão 5 minutos
  forceRefresh?: boolean;
  userId?: string; // ID do usuário para isolar cache
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Hook genérico para cache de dados
 * Evita consultas desnecessárias ao banco de dados
 */
export function useCache<T>(
  fetchFunction: () => Promise<T>,
  options: CacheOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasShownToast = useRef(false);
  
  const { key, duration = 5 * 60 * 1000, forceRefresh = false, userId } = options;
  
  // Gerar chave única por usuário
  const getCacheKey = () => {
    if (userId) {
      return `${key}_user_${userId}`;
    }
    return key;
  };

  // Funções de cache
  const getCachedData = (): T | null => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const { data, timestamp }: CachedData<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar se o cache ainda é válido
      if (now - timestamp < duration) {
        return data;
      }
      
      // Cache expirado, remover
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      
      localStorage.removeItem(getCacheKey());
      return null;
    }
  };

  const setCachedData = (data: T) => {
    try {
      const cacheKey = getCacheKey();
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch (error) {
      
    }
  };

  const clearCache = () => {
    const cacheKey = getCacheKey();
    localStorage.removeItem(cacheKey);
    hasShownToast.current = false;
  };

  const fetchData = async (force = false) => {
    // Verificar cache primeiro (se não for refresh forçado)
    if (!force) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      // Salvar no cache
      setCachedData(result);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados inicial
  useEffect(() => {
    fetchData(forceRefresh);
  }, [key, forceRefresh]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchData(true),
    clearCache,
    hasShownToast: hasShownToast.current,
    invalidateCache: clearCache
  };
}

/**
 * Hook específico para cache de configurações da loja
 */
export function useStoreConfigCache() {
  return useCache(
    async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Token de acesso não encontrado');

      const response = await fetch('/api/seller/store/config', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        // Se a loja não existe (404), retornar dados padrão
        if (response.status === 404) {
          return {
            store: {
              id: null,
              name: '',
              contactEmail: '',
              logoUrl: null,
              homeBannerUrl: null,
              storeBannerUrl: null,
              primaryColor: '#bd253c',
              secondaryColor: '#970b27',
              subdomain: null,
            }
          };
        }
        throw new Error('Erro ao buscar configurações da loja');
      }

      return await response.json();
    },
    {
      key: 'store_config',
      duration: 10 * 60 * 1000, // 10 minutos para configurações da loja
      userId: (() => {
        try {
          // Verificar se estamos no lado do cliente
          if (typeof window === 'undefined') return null;
          
          const token = localStorage.getItem('access_token');
          if (token) {
            // Decodificar JWT para obter userId (método simples)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub || null;
          }
        } catch (error) {
          console.error('Erro ao obter userId do token:', error);
        }
        return null;
      })(),
    }
  );
}

/**
 * Hook específico para cache de categorias e produtos
 */
export function useCategoriesCache() {
  return useCache(
    async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Token de acesso não encontrado');

      const response = await fetch('/api/seller/categories/list', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar categorias');
      }

      return await response.json();
    },
    {
      key: 'categories_products',
      duration: 30 * 1000, // 30 segundos para atualização rápida de estoque
      userId: (() => {
        try {
          // Verificar se estamos no lado do cliente
          if (typeof window === 'undefined') return null;
          
          const token = localStorage.getItem('access_token');
          if (token) {
            // Decodificar JWT para obter userId (método simples)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub || null;
          }
        } catch (error) {
          console.error('Erro ao obter userId do token:', error);
        }
        return null;
      })(),
    }
  );
}

/**
 * Hook específico para cache de dados de integração
 */
export function useIntegrationDataCache() {
  return useCache(
    async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Token de acesso não encontrado');

      // Obter userId do token para buscar sellerId
      let userId: string | null = null;
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        userId = payload.userId || payload.sub || null;
      } catch (error) {
        console.error('Erro ao obter userId do token:', error);
        throw new Error('Token inválido');
      }

      if (!userId) {
        throw new Error('UserId não encontrado no token');
      }

      // Buscar sellerId primeiro
      const profileResponse = await fetch(`/api/seller/profile/me?userId=${userId}`, {
        credentials: 'include',
      });

      if (!profileResponse.ok) {
        throw new Error('Erro ao buscar perfil do seller');
      }

      const profile = await profileResponse.json();
      const sellerId = profile.id;

      // Buscar dados de integração em paralelo
      const [mpStatusResponse, storeResponse] = await Promise.all([
        fetch(`/api/seller/mercadopago/status?sellerId=${sellerId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }),
        fetch('/api/seller/store/config', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        })
      ]);

      const mpStatus = mpStatusResponse.ok ? await mpStatusResponse.json() : null;
      const storeData = storeResponse.ok ? await storeResponse.json() : null;

      return {
        mpStatus,
        storeData,
        activeIntegrations: mpStatus?.connected ? 1 : 0,
        lastSync: mpStatus?.lastSync,
        connected: mpStatus?.connected || false
      };
    },
    {
      key: 'integration_data',
      duration: 2 * 60 * 1000, // 2 minutos para dados de integração
      userId: (() => {
        try {
          // Verificar se estamos no lado do cliente
          if (typeof window === 'undefined') return null;
          
          const token = localStorage.getItem('access_token');
          if (token) {
            // Decodificar JWT para obter userId (método simples)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub || null;
          }
        } catch (error) {
          console.error('Erro ao obter userId do token:', error);
        }
        return null;
      })(),
    }
  );
}
