'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, Plus } from 'lucide-react';
import NumberCard from '@/app/components/cards/numberCard';
import IntegrationCard from '@/app/components/cards/integrationCard';
import Button from '@/app/components/buttons/button';

export default function Integrations() {
  const [integrations] = useState([
    {
      id: '1',
      name: 'Mercado Pago',
      description: 'Processamento de pagamentos com PIX, cartão de crédito e débito',
      status: 'active' as const,
      icon: CreditCard,
      lastSync: '15/01/2024 às 10:30'
    }
  ]);

  const handleConfigureIntegration = () => {
    console.log('Configurar integração');
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
          value={1}
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
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              name={integration.name}
              description={integration.description}
              status={integration.status}
              icon={integration.icon}
              lastSync={integration.lastSync}
              onConfigure={handleConfigureIntegration}
            />
          ))}
        </div>
      </div>
    </div>
  );
}