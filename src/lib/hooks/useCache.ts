import { useState, useEffect, useRef } from 'react';

interface CacheOptions {
  key: string;
  duration?: number; // em milissegundos, padrão 5 minutos
  forceRefresh?: boolean;
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
  
  const { key, duration = 5 * 60 * 1000, forceRefresh = false } = options;

  // Funções de cache
  const getCachedData = (): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp }: CachedData<T> = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar se o cache ainda é válido
      if (now - timestamp < duration) {
        console.log(`📦 [Cache] Usando dados do cache para ${key}`);
        return data;
      }
      
      // Cache expirado, remover
      localStorage.removeItem(key);
      return null;
    } catch (error) {
      console.error(`Erro ao ler cache para ${key}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  };

  const setCachedData = (data: T) => {
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cached));
      console.log(`💾 [Cache] Dados salvos no cache para ${key}`);
    } catch (error) {
      console.error(`Erro ao salvar cache para ${key}:`, error);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(key);
    hasShownToast.current = false;
    console.log(`🗑️ [Cache] Cache limpo para ${key}`);
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
      console.log(`🌐 [Cache] Buscando dados do servidor para ${key}...`);
      
      const result = await fetchFunction();
      
      // Salvar no cache
      setCachedData(result);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`Erro ao buscar dados para ${key}:`, errorMessage);
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
    hasShownToast: hasShownToast.current
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
        throw new Error('Erro ao buscar configurações da loja');
      }

      return await response.json();
    },
    {
      key: 'store_config',
      duration: 10 * 60 * 1000, // 10 minutos para configurações da loja
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
      duration: 3 * 60 * 1000, // 3 minutos para categorias e produtos
    }
  );
}
