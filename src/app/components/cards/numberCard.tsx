'use client';

import { LucideIcon } from "lucide-react";

interface NumberCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string | number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  background?: 'transparent' | 'colored';
  className?: string;
}

export default function NumberCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  background = 'transparent',
  className = "",
}: NumberCardProps) {
  return (
    <div 
      className={`
        ${background === 'transparent' 
          ? 'bg-[var(--background)]' 
          : 'bg-[var(--secondary)]/5'
        }
        border border-[var(--on-background)]
        rounded-2xl
        p-6
        transition-all
        hover:shadow-md
        ${className}
      `}
    >
      {/* Header com título e ícone */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--on-background)]">
          {title}
        </h3>
        <div className="p-2 bg-[var(--primary)] rounded-full">
          <Icon size={20} className="text-[var(--on-primary)]" />
        </div>
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-[var(--foreground)]">
          {value.toLocaleString('pt-BR')}
        </p>
      </div>

      {/* Mudança percentual (opcional) */}
      {change !== undefined && changeType && (
        <div className="flex items-center gap-1">
          <span 
            className={`
              text-sm font-medium
              ${changeType === 'increase' 
                ? 'text-green-600' 
                : 'text-red-600'
              }
            `}
          >
                         {changeType === 'increase' ? '+' : '-'}{Math.abs(Number(change))}%
          </span>
          <span className="text-sm text-[var(--on-background)]">
            vs mês anterior
          </span>
        </div>
      )}
    </div>
  );
}
