import { useCallback } from 'react';

/**
 * Hook para gerenciar invalidação de cache
 * Permite invalidar caches específicos ou todos os caches relacionados ao usuário
 */
export function useCacheInvalidation() {
  const invalidateCache = useCallback((key: string, userId?: string) => {
    try {
      const cacheKey = userId ? `${key}_user_${userId}` : key;
      localStorage.removeItem(cacheKey);
      console.log(`🗑️ [Cache] Cache invalidado para ${cacheKey}`);
    } catch (error) {
      console.error(`Erro ao invalidar cache para ${key}:`, error);
    }
  }, []);

  const invalidateAllUserCaches = useCallback((userId: string) => {
    try {
      const keys = Object.keys(localStorage);
      const userCacheKeys = keys.filter(key => key.includes(`_user_${userId}`));
      
      userCacheKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ [Cache] Cache invalidado: ${key}`);
      });
      
      console.log(`🗑️ [Cache] Todos os caches do usuário ${userId} foram invalidados`);
    } catch (error) {
      console.error('Erro ao invalidar todos os caches do usuário:', error);
    }
  }, []);

  const invalidateOrderRelatedCaches = useCallback((userId?: string) => {
    const orderCacheKeys = [
      'customer_orders_list',
      'store_data',
      'integration_data'
    ];

    orderCacheKeys.forEach(key => {
      invalidateCache(key, userId);
    });
  }, [invalidateCache]);

  return {
    invalidateCache,
    invalidateAllUserCaches,
    invalidateOrderRelatedCaches
  };
}

/**
 * Hook específico para invalidar cache após operações de pedido
 */
export function useOrderCacheInvalidation() {
  const { invalidateOrderRelatedCaches } = useCacheInvalidation();

  const invalidateAfterOrderUpdate = useCallback((userId?: string) => {
    // Invalidar caches relacionados a pedidos após atualizações
    invalidateOrderRelatedCaches(userId);
    
    // Também invalidar cache de categorias/produtos se necessário
    try {
      const token = localStorage.getItem('customer_access_token');
      if (token && userId) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const tokenUserId = payload.userId || payload.sub;
        if (tokenUserId) {
          invalidateOrderRelatedCaches(tokenUserId);
        }
      }
    } catch (error) {
      console.error('Erro ao obter userId para invalidação:', error);
    }
  }, [invalidateOrderRelatedCaches]);

  return {
    invalidateAfterOrderUpdate
  };
}
