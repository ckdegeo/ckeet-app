'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import NumberCard from '@/app/components/cards/numberCard';
import IntegrationCard from '@/app/components/cards/integrationCard';
import { useMercadoPago } from '@/lib/hooks/useMercadoPago';

function IntegrationsContent() {
  const searchParams = useSearchParams();

  // Hook do Mercado Pago (agora busca sellerId automaticamente)
  const { status: mpStatus, connecting, disconnecting, connect, disconnect } = useMercadoPago();

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

  const handleConfigureIntegration = () => {
    if (mpStatus?.connected) {
      disconnect();
    } else {
      connect();
    }
  };

  const getIntegrationStatus = () => {
    if (!mpStatus) return 'inactive';
    if (mpStatus.connected) return 'active';
    if (mpStatus.status === 'EXPIRED') return 'error';
    return 'inactive';
  };

  const getLastSync = () => {
    if (!mpStatus?.lastSync) return undefined;
    return new Date(mpStatus.lastSync).toLocaleString('pt-BR');
  };

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
          value={mpStatus?.connected ? 1 : 0}
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