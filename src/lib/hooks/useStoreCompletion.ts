'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/utils/authUtils';
import { showErrorToast } from '@/lib/utils/toastUtils';

interface StoreCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export function useStoreCompletion() {
  const [storeStatus, setStoreStatus] = useState<StoreCompletionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkStoreCompletion = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/seller/store/completion', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStoreStatus(data);
        
        // Se a loja não está completa e não estamos na página de configuração
        if (!data.isComplete && !window.location.pathname.includes('/seller/store')) {
          showErrorToast('Complete a configuração da sua loja para acessar outras funcionalidades');
          router.push('/seller/store?incomplete=true');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar completude da loja:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStoreCompletion();
  }, []);

  return {
    storeStatus,
    isLoading,
    checkStoreCompletion
  };
}
