'use client';

import { Check, AlertCircle } from 'lucide-react';
import Button from '../buttons/button';
import Image from 'next/image';

interface IntegrationCardProps {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  logoUrl?: string;
  lastSync?: string;
  onConfigure: () => void;
  configuring?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
  className?: string;
}

export default function IntegrationCard({
  name,
  description,
  status,
  logoUrl,
  lastSync,
  onConfigure,
  configuring = false,
  disabled = false,
  comingSoon = false,
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
        bg-[var(--surface)]
        border border-[var(--on-background)]
        rounded-2xl
        p-6
        transition-all
        ${disabled || comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Logo e Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {logoUrl && (
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 rounded-xl bg-[var(--background)] p-2 flex items-center justify-center border border-[var(--on-background)]/20 ${disabled || comingSoon ? 'grayscale' : ''}`}>
                <Image
                  src={logoUrl}
                  alt={name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-semibold ${disabled || comingSoon ? 'text-[var(--on-background)]' : 'text-[var(--foreground)]'}`}>
                {name}
              </h3>
              {comingSoon ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                  Em breve
                </span>
              ) : (
                <span 
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    ${statusInfo.color} ${statusInfo.bgColor}
                  `}
                >
                  <StatusIcon size={12} />
                  {statusInfo.text}
                </span>
              )}
            </div>
            <p className={`text-sm mb-2 ${disabled || comingSoon ? 'text-[var(--on-background)]/60' : 'text-[var(--on-background)]'}`}>
              {description}
            </p>
            {lastSync && !comingSoon && (
              <p className="text-xs text-[var(--on-background)]">
                Última sincronização: {lastSync}
              </p>
            )}
          </div>
        </div>

        {/* Botão de ação */}
        <div className="flex-shrink-0">
          {comingSoon ? (
            <Button 
              disabled={true}
            >
              Em breve
            </Button>
          ) : (
            <Button 
              onClick={onConfigure}
              disabled={configuring || disabled}
            >
              {configuring ? 'Processando...' : status === 'active' ? 'Desconectar' : 'Conectar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}