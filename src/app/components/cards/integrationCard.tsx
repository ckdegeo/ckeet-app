'use client';

import { LucideIcon, Check, AlertCircle } from 'lucide-react';
import Button from '../buttons/button';

interface IntegrationCardProps {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  icon: LucideIcon;
  lastSync?: string;
  onConfigure: () => void;
  className?: string;
}

export default function IntegrationCard({
  name,
  description,
  status,
  icon: Icon,
  lastSync,
  onConfigure,
  className = "",
}: IntegrationCardProps) {
  const statusConfig = {
    active: {
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
      text: 'Ativo',
      icon: Check
    },
    inactive: {
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      text: 'Inativo',
      icon: AlertCircle
    },
    error: {
      color: 'text-red-600',
      bgColor: 'bg-red-600/10',
      text: 'Erro',
      icon: AlertCircle
    }
  };

  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <div 
      className={`
        bg-[var(--background)]
        border border-[var(--on-background)]
        rounded-2xl
        p-6
        transition-all
        hover:shadow-md
        ${className}
      `}
    >
      {/* Header com ícone e status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--primary)]/10 rounded-full">
            <Icon size={24} className="text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[var(--foreground)]">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${statusInfo.color} ${statusInfo.bgColor}
                `}
              >
                <StatusIcon size={12} />
                {statusInfo.text}
              </span>
              {lastSync && (
                <span className="text-xs text-[var(--on-background)]">
                  Última sincronização: {lastSync}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Descrição */}
      <p className="text-sm text-[var(--on-background)] mb-6">
        {description}
      </p>

      {/* Ações */}
      <div className="flex items-center justify-end">
        <Button 
          onClick={onConfigure} 
        >
          Configurar
        </Button>
      </div>
    </div>
  );
}