/**
 * Utilitários para gerenciamento de cache
 */

/**
 * Limpa todo o cache relacionado a um usuário específico
 * @param userId - ID do usuário (opcional, se não fornecido limpa todo o cache)
 */
export function clearUserCache(userId?: string) {
  try {
    if (userId) {
      // Limpar cache específico do usuário
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`_user_${userId}`)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    } else {
      // Limpar todo o cache da aplicação
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('store_config') ||
          key.includes('categories_products') ||
          key.includes('mercadopago_status')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
}

/**
 * Limpa todo o cache da aplicação (usado no logout)
 */
export function clearAllCache() {
  clearUserCache();
}

/**
 * Obtém informações sobre o cache atual
 */
export function getCacheInfo() {
  const cacheInfo: { key: string; size: number; timestamp?: number }[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('store_config') ||
        key.includes('categories_products') ||
        key.includes('mercadopago_status')
      )) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            cacheInfo.push({
              key,
              size: value.length,
              timestamp: parsed.timestamp
            });
          } catch {
            cacheInfo.push({
              key,
              size: value.length
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao obter informações do cache:', error);
  }
  
  return cacheInfo;
}
