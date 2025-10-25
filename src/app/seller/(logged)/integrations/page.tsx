'use client';

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import NumberCard from '@/app/components/cards/numberCard';
import IntegrationCard from '@/app/components/cards/integrationCard';
import { useMercadoPago } from '@/lib/hooks/useMercadoPago';
import { useIntegrationDataCache } from '@/lib/hooks/useCache';

function IntegrationsContent() {
  const searchParams = useSearchParams();

  // Hook do Mercado Pago (agora busca sellerId automaticamente)
  const { status: mpStatus, connecting, disconnecting, connect, disconnect, clearCache } = useMercadoPago();
  
  // Hook de cache para dados de integração
  const { data: integrationData, loading: integrationLoading, error: integrationError, refresh: refreshIntegrationData } = useIntegrationDataCache();
  
  // Estado para controlar se todos os dados estão prontos
  const [isDataReady, setIsDataReady] = useState(false);

  // Verificar parâmetros da URL para mostrar mensagens de erro
  useEffect(() => {
    const error = searchParams.get('error');

    if (error === 'authorization_denied') {
      toast.error('Autorização negada pelo Mercado Pago');
    } else if (error === 'missing_parameters') {
      toast.error('Parâmetros inválidos na conexão');
    } else if (error === 'connection_failed') {
      toast.error('Falha na conexão com o Mercado Pago');
    }
  }, [searchParams]);

  // Controlar quando todos os dados estão prontos
  useEffect(() => {
    // Aguardar tanto o cache quanto o hook do MercadoPago estarem prontos
    const isCacheReady = !integrationLoading && (integrationData || integrationError);
    const isMercadoPagoReady = mpStatus !== null;
    
    // Só liberar a tela quando ambos estiverem prontos
    if (isCacheReady && isMercadoPagoReady) {
      setIsDataReady(true);
    }
  }, [integrationLoading, integrationData, integrationError, mpStatus]);

  const handleConfigureIntegration = async () => {
    // Resetar estado de loading durante a operação
    setIsDataReady(false);
    
    if (mpStatus?.connected) {
      await disconnect();
      // Limpar cache após desconectar
      refreshIntegrationData();
    } else {
      await connect();
      // Limpar cache após conectar
      refreshIntegrationData();
    }
  };

  // Função para limpar cache (útil para debug)
  const handleClearCache = () => {
    clearCache();
    // Recarregar a página para forçar nova busca
    window.location.reload();
  };

  const getIntegrationStatus = () => {
    // Usar dados do cache se disponível, senão usar dados do hook
    const status = integrationData?.mpStatus || mpStatus;
    if (!status) return 'inactive';
    if (status.connected) return 'active';
    if (status.status === 'EXPIRED') return 'error';
    return 'inactive';
  };

  const getLastSync = () => {
    // Usar dados do cache se disponível, senão usar dados do hook
    const lastSync = integrationData?.lastSync || mpStatus?.lastSync;
    if (!lastSync) return undefined;
    return new Date(lastSync).toLocaleString('pt-BR');
  };

  const getActiveIntegrations = () => {
    // Usar dados do cache se disponível
    return integrationData?.activeIntegrations || (mpStatus?.connected ? 1 : 0);
  };

  // Mostrar loading global até todos os dados estarem prontos
  if (!isDataReady) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)] mx-auto"></div>
          <h3 className="mt-6 text-lg font-medium text-[var(--foreground)]">
            Carregando integrações
          </h3>
          <div className="mt-4 flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver (só depois que os dados estiverem prontos)
  if (integrationError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            Erro ao carregar integrações
          </h3>
          <p className="text-[var(--on-background)] mb-4">{integrationError}</p>
          <button 
            onClick={() => {
              setIsDataReady(false);
              refreshIntegrationData();
            }} 
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-variant)] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Integrações
          </h1>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <NumberCard
          title="Integrações Ativas"
          value={getActiveIntegrations()}
          icon={CheckCircle}
        />
      </div>

      <hr className="border-t border-black/10" />

      {/* Lista Simples */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Adquirentes
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IntegrationCard
            name="Mercado Pago"
            description="Processamento de pagamentos com PIX, cartão de crédito e débito"
            status={getIntegrationStatus()}
            icon={CreditCard}
            lastSync={getLastSync()}
            onConfigure={handleConfigureIntegration}
            configuring={connecting || disconnecting}
          />
        </div>
      </div>
    </div>
  );
}

export default function Integrations() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <IntegrationsContent />
    </Suspense>
  );
}