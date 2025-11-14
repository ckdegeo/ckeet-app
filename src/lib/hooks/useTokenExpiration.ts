'use client';

import { useEffect } from 'react';
import { checkTokenExpiration, apiFetch } from '@/lib/utils/apiClient';

/**
 * Hook para verificar periodicamente se o token expirou
 * e redirecionar para login se necessário
 */
export function useTokenExpiration() {
  useEffect(() => {
    // Verificar imediatamente
    checkTokenExpiration();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
}

/**
 * Hook para interceptar fetch e redirecionar em caso de 401
 * Substitui o fetch global por uma versão que intercepta erros
 */
export function useApiInterceptor() {
  useEffect(() => {
    // Salvar o fetch original
    const originalFetch = window.fetch;
    
    // Substituir fetch global
    window.fetch = async function(...args: Parameters<typeof fetch>) {
      const response = await originalFetch(...args);
      
      // Se receber 401, verificar e redirecionar
      if (response.status === 401) {
        const url = args[0];
        const isStringUrl = typeof url === 'string';
        const urlPath = isStringUrl ? url : (url as URL).pathname;
        
        // Não redirecionar se já estiver em página de login ou se for rota de refresh
        const isLoginPage = window.location.pathname.includes('/auth/login') || 
                           window.location.pathname.includes('/auth/register');
        const isRefreshRoute = urlPath.includes('/auth/refresh');
        
        if (!isLoginPage && !isRefreshRoute) {
          checkTokenExpiration();
        }
      }
      
      return response;
    };
    
    // Restaurar fetch original ao desmontar
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}

