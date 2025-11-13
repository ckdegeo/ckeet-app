'use client';

import { useEffect, Suspense, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, CheckCircle, BarChart3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import NumberCard from '@/app/components/cards/numberCard';
import IntegrationCard from '@/app/components/cards/integrationCard';
import Tabs from '@/app/components/tabs/tabs';
import { useMercadoPago } from '@/lib/hooks/useMercadoPago';
import { useIntegrationDataCache } from '@/lib/hooks/useCache';
import IntegrationsSkeleton from '@/app/components/integrations/integrationsSkeleton';

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('acquirers');

  // Hook do Mercado Pago (agora busca sellerId automaticamente)
  const { status: mpStatus, connecting, disconnecting, connect, disconnect, clearCache } = useMercadoPago();
  
  // Hook de cache para dados de integração
  const { data: integrationData, loading: integrationLoading, error: integrationError, refresh: refreshIntegrationData } = useIntegrationDataCache();
  
  // Estado para controlar se todos os dados estão prontos
  const [isDataReady, setIsDataReady] = useState(false);
  
  // Rastrear estado anterior da integração para detectar mudanças
  const previousConnectionStateRef = useRef<boolean | null>(null);
  const hasProcessedUrlParamsRef = useRef(false);

  // Verificar parâmetros da URL para mostrar mensagens de erro e sucesso
  // IMPORTANTE: Só processar se realmente veio do callback OAuth
  useEffect(() => {
    // Só processar se ainda não foi processado e os dados estão prontos
    if (hasProcessedUrlParamsRef.current || !isDataReady) {
      return;
    }

    const error = searchParams.get('error');
    const success = searchParams.get('success');

    // Se não há parâmetros para processar, sair
    if (!error && !success) {
      return;
    }

    // Verificar se realmente veio do OAuth callback
    // Se sim, haverá uma flag no sessionStorage
    const isOAuthCallback = sessionStorage.getItem('mp_oauth_initiated') === 'true';
    
    // Processar erros (sempre mostrar, mesmo que não seja callback)
    if (error) {
      if (error === 'authorization_denied') {
        toast.error('Autorização negada pelo Mercado Pago');
      } else if (error === 'missing_parameters') {
        toast.error('Parâmetros inválidos na conexão');
      } else if (error === 'connection_failed') {
        toast.error('Falha na conexão com o Mercado Pago');
      }
      
      // Limpar flags
      sessionStorage.removeItem('mp_oauth_initiated');
      hasProcessedUrlParamsRef.current = true;
      router.replace('/seller/integrations');
      return;
    }
    
    // Para sucesso, só processar se realmente veio do OAuth
    if (success === 'connected' && isOAuthCallback) {
      // Verificar se houve mudança real de estado (de desconectado para conectado)
      const wasConnected = previousConnectionStateRef.current;
      const isNowConnected = mpStatus?.connected || integrationData?.mpStatus?.connected || false;
      
      // Só mostrar toast se mudou de desconectado para conectado
      if (wasConnected === false && isNowConnected) {
        toast.success('Conectado');
      }
      
      // Atualizar estado anterior para refletir a nova conexão
      previousConnectionStateRef.current = isNowConnected;
      
      // Limpar cache e recarregar dados
      clearCache();
      refreshIntegrationData();
      
      // Limpar flags
      sessionStorage.removeItem('mp_oauth_initiated');
      hasProcessedUrlParamsRef.current = true;
      
      // Limpar parâmetros da URL
      router.replace('/seller/integrations');
    } else if (success === 'connected' && !isOAuthCallback) {
      // Se há parâmetro success mas não veio do OAuth, apenas limpar a URL
      hasProcessedUrlParamsRef.current = true;
      router.replace('/seller/integrations');
    }
  }, [searchParams, isDataReady, mpStatus, integrationData, clearCache, refreshIntegrationData, router]);

  // Controlar quando todos os dados estão prontos e rastrear mudanças de estado
  useEffect(() => {
    // Aguardar tanto o cache quanto o hook do MercadoPago estarem prontos
    const isCacheReady = !integrationLoading && (integrationData || integrationError);
    const isMercadoPagoReady = mpStatus !== null;
    
    // Só liberar a tela quando ambos estiverem prontos
    if (isCacheReady && isMercadoPagoReady) {
      // Rastrear estado atual da conexão
      const currentConnectionState = mpStatus?.connected || integrationData?.mpStatus?.connected || false;
      
      // Se é a primeira vez que temos dados, salvar o estado inicial
      if (previousConnectionStateRef.current === null) {
        previousConnectionStateRef.current = currentConnectionState;
      }
      
      setIsDataReady(true);
    }
  }, [integrationLoading, integrationData, integrationError, mpStatus]);

  const handleConfigureIntegration = async () => {
    // Resetar estado de loading durante a operação
    setIsDataReady(false);
    
    // Salvar estado anterior antes da mudança
    const previousState = mpStatus?.connected || integrationData?.mpStatus?.connected || false;
    
    if (previousState) {
      // Desconectar
      await disconnect();
      toast.success('Desconectado');
      previousConnectionStateRef.current = false;
      // Limpar cache de dados de integração após desconectar
      refreshIntegrationData();
      // Aguardar um pouco para garantir que o cache foi limpo
      setTimeout(() => {
        setIsDataReady(true);
      }, 500);
    } else {
      // Conectar - redireciona para OAuth
      // Marcar que estamos iniciando o fluxo OAuth
      sessionStorage.setItem('mp_oauth_initiated', 'true');
      // Salvar que estava desconectado antes de iniciar o OAuth
      previousConnectionStateRef.current = false;
      // Resetar flag de processamento para permitir processar o callback quando voltar
      hasProcessedUrlParamsRef.current = false;
      await connect();
      // O toast será mostrado quando voltar do callback OAuth
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
    return <IntegrationsSkeleton />;
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

  // Conteúdo da Tab Adquirentes
  const acquirersContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mercado Pago - Ativo */}
        <IntegrationCard
          name="Mercado Pago"
          description="Processamento de pagamentos com PIX, cartão de crédito e débito"
          status={getIntegrationStatus()}
          logoUrl="/mp.png"
          lastSync={getLastSync()}
          onConfigure={handleConfigureIntegration}
          configuring={connecting || disconnecting}
        />

        {/* Stripe - Em breve */}
        <IntegrationCard
          name="Stripe"
          description="Gateway de pagamentos internacional com split payment e múltiplas moedas"
          status="inactive"
          logoUrl="/stripe.png"
          comingSoon={true}
          onConfigure={() => {}}
        />

        {/* PagBank - Em breve */}
        <IntegrationCard
          name="PagBank"
          description="Solução completa de pagamentos com split automático e gestão de recebíveis"
          status="inactive"
          logoUrl="/pagbank.png"
          comingSoon={true}
          onConfigure={() => {}}
        />

        {/* Asaas - Em breve */}
        <IntegrationCard
          name="Asaas"
          description="Plataforma de cobrança com split payment, assinaturas e gestão financeira"
          status="inactive"
          logoUrl="/asaas.png"
          comingSoon={true}
          onConfigure={() => {}}
        />

        {/* Efí - Em breve */}
        <IntegrationCard
          name="Efí"
          description="API de pagamentos com split de recebimento e gestão de transações"
          status="inactive"
          logoUrl="/efi.png"
          comingSoon={true}
          onConfigure={() => {}}
        />
      </div>
    </div>
  );

  // Conteúdo da Tab Rastreamento
  const trackingContent = (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
            <BarChart3 size={32} className="text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Rastreamento
          </h3>
          <p className="text-sm text-[var(--on-background)]">
            Em breve você poderá configurar ferramentas de rastreamento e analytics para sua loja.
          </p>
        </div>
      </div>
    </div>
  );

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

      {/* Tabs */}
      <Tabs
        items={[
          {
            id: 'acquirers',
            label: 'Adquirentes',
            icon: CreditCard,
            content: acquirersContent,
          },
          {
            id: 'tracking',
            label: 'Rastreamento',
            icon: BarChart3,
            content: trackingContent,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
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