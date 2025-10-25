import { useEffect } from 'react';
import { clearAllToasts } from '@/lib/utils/toastUtils';

// Hook para limpar toasts automaticamente
export function useToastCleanup() {
  useEffect(() => {
    // Limpar toasts antigos ao montar o componente
    clearAllToasts();

    // Forçar fechamento de toasts após 10 segundos
    const timeout = setTimeout(() => {
      clearAllToasts();
    }, 10000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);
}

// Hook para limpar toasts em mudanças de rota
export function useRouteToastCleanup() {
  useEffect(() => {
    const handleRouteChange = () => {
      clearAllToasts();
    };

    // Limpar toasts ao mudar de rota
    window.addEventListener('beforeunload', handleRouteChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
    };
  }, []);
}
