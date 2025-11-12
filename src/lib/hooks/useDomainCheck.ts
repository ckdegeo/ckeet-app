'use client';

import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

interface DomainConfig {
  subdomain: string;
}

interface DomainCheckResult {
  hasDomain: boolean;
  subdomain: string | null;
  storeId: string | null;
}

export function useDomainCheck() {
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainConfig, setDomainConfig] = useState<DomainConfig>({
    subdomain: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Função para verificar se o seller atual tem domínio configurado
  const checkDomain = async () => {
    try {
      setIsChecking(true);
      
      // Sempre verificar no banco de dados se o usuário atual tem domínio
      // Isso garante que cada conta tenha sua própria verificação
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        // Se não há token, não mostrar modal imediatamente
        // Pode ser que o usuário esteja em processo de autenticação
        // Só mostrar se estiver em uma rota que requer autenticação
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/seller/') && !currentPath.includes('/auth/')) {
          setShowDomainModal(true);
        }
        return;
      }

      // Fazer requisição para verificar se ESTE usuário específico tem domínio
      const response = await fetch('/api/seller/store/domain', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Se ESTE usuário já tem domínio, não mostrar o modal
        setDomainConfig({
          subdomain: data.subdomain || '',
        });
        setShowDomainModal(false);
      } else if (response.status === 404) {
        // Se ESTE usuário não tem domínio configurado, mostrar o modal
        // Mas não mostrar se estiver na página de integrações após conectar Mercado Pago
        const currentPath = window.location.pathname;
        const isIntegrationsPage = currentPath === '/seller/integrations';
        const hasSuccessParam = new URLSearchParams(window.location.search).get('success') === 'connected';
        
        // Não mostrar modal se acabou de conectar Mercado Pago
        if (isIntegrationsPage && hasSuccessParam) {
          setShowDomainModal(false);
        } else {
          setShowDomainModal(true);
        }
      } else if (response.status === 401) {
        // Token inválido ou expirado - não mostrar modal imediatamente
        // Pode ser um problema temporário de sessão
        console.warn('Token inválido ao verificar domínio, mas não mostrando modal para evitar interrupção');
        setShowDomainModal(false);
      } else {
        throw new Error('Erro ao verificar domínio');
      }
    } catch (error) {
      console.error('Erro ao verificar domínio:', error);
      // Se houver erro de rede, não mostrar modal imediatamente
      // Pode ser um problema temporário
      const currentPath = window.location.pathname;
      const isIntegrationsPage = currentPath === '/seller/integrations';
      const hasSuccessParam = new URLSearchParams(window.location.search).get('success') === 'connected';
      
      // Não mostrar modal se acabou de conectar Mercado Pago
      if (isIntegrationsPage && hasSuccessParam) {
        setShowDomainModal(false);
      } else {
        // Só mostrar modal se não for erro de rede temporário
        setShowDomainModal(true);
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Verificar domínio na inicialização
  useEffect(() => {
    checkDomain();
  }, []);

  // Salvar configuração de domínio
  const saveDomainConfig = async (config: DomainConfig) => {
    try {
      setIsLoading(true);

      // Verificar se há token de acesso
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/seller/store/domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          subdomain: config.subdomain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao configurar domínio');
      }

      showSuccessToast(data.message || 'Domínio criado com sucesso!');
      setDomainConfig(config);
      setShowDomainModal(false);
      
      // Recarregar a verificação de domínio para garantir que está atualizado
      setTimeout(() => {
        checkDomain();
      }, 1000);
      
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
    recheckDomain: checkDomain, // Função para recarregar verificação
  };
}

