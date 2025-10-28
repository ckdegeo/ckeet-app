/**
 * Utilitários para invalidação de cache
 */

/**
 * Limpa o cache de categorias e produtos para um usuário específico
 */
export const invalidateCategoriesCache = (userId: string) => {
  if (typeof window === 'undefined') return; // SSR check
  
  try {
    const cacheKey = `categories_products_user_${userId}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Erro ao limpar cache de categorias:', error);
  }
};

/**
 * Limpa o cache de dados de integração para um usuário específico
 */
export const invalidateIntegrationCache = (userId: string) => {
  if (typeof window === 'undefined') return; // SSR check
  
  try {
    const cacheKey = `integration_data_user_${userId}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Erro ao limpar cache de integração:', error);
  }
};

/**
 * Limpa o cache de configurações da loja para um usuário específico
 */
export const invalidateStoreConfigCache = (userId: string) => {
  if (typeof window === 'undefined') return; // SSR check
  
  try {
    const cacheKey = `store_config_user_${userId}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Erro ao limpar cache de configurações da loja:', error);
  }
};

/**
 * Limpa o cache do Mercado Pago para um usuário específico
 */
export const invalidateMercadoPagoCache = (userId: string) => {
  if (typeof window === 'undefined') return; // SSR check
  
  try {
    const cacheKey = `mercadopago_status_user_${userId}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Erro ao limpar cache do Mercado Pago:', error);
  }
};

/**
 * Limpa todos os caches relacionados a produtos e categorias
 * Usado quando produtos ou categorias são criados, editados ou excluídos
 */
export const invalidateProductCategoryCaches = (userId: string) => {
  invalidateCategoriesCache(userId);
  invalidateStoreConfigCache(userId);
};

/**
 * Limpa todos os caches relacionados a integrações
 * Usado quando configurações de integração são alteradas
 */
export const invalidateIntegrationCaches = (userId: string) => {
  invalidateIntegrationCache(userId);
  invalidateMercadoPagoCache(userId);
};

/**
 * Limpa todos os caches para um usuário
 * Usado no logout ou quando necessário limpar tudo
 */
export const invalidateAllCaches = (userId: string) => {
  invalidateCategoriesCache(userId);
  invalidateIntegrationCache(userId);
  invalidateStoreConfigCache(userId);
  invalidateMercadoPagoCache(userId);
};
