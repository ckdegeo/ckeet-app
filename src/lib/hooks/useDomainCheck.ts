'use client';

import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

interface DomainConfig {
  customDomain: string;
  subdomain: string;
  sslEnabled: boolean;
}

interface DomainCheckResult {
  hasDomain: boolean;
  subdomain: string | null;
  customDomain: string | null;
  storeId: string | null;
}

export function useDomainCheck() {
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainConfig, setDomainConfig] = useState<DomainConfig>({
    customDomain: '',
    subdomain: '',
    sslEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Verificar se o seller já tem domínio configurado
  useEffect(() => {
    const checkDomain = async () => {
      try {
        setIsChecking(true);
        const response = await fetch('/api/seller/store/domain');
        
        if (!response.ok) {
          throw new Error('Erro ao verificar domínio');
        }

        const data: DomainCheckResult = await response.json();
        
        // Se não tem domínio configurado, mostrar o modal
        if (!data.hasDomain) {
          setShowDomainModal(true);
        } else {
          // Se já tem domínio, carregar os dados
          setDomainConfig({
            subdomain: data.subdomain || '',
            customDomain: data.customDomain || '',
            sslEnabled: true,
          });
        }
      } catch (error) {
        console.error('Erro ao verificar domínio:', error);
        // Se houver erro, não mostrar o modal para não bloquear o usuário
      } finally {
        setIsChecking(false);
      }
    };

    checkDomain();
  }, []);

  // Salvar configuração de domínio
  const saveDomainConfig = async (config: DomainConfig) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/seller/store/domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain: config.subdomain,
          customDomain: config.customDomain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao configurar domínio');
      }

      showSuccessToast(data.message || 'Domínio configurado com sucesso!');
      setDomainConfig(config);
      setShowDomainModal(false);
      
      return true;
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao configurar domínio');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showDomainModal,
    setShowDomainModal,
    domainConfig,
    saveDomainConfig,
    isLoading,
    isChecking,
  };
}

