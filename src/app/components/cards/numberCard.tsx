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
  style?: React.CSSProperties;
}

export default function NumberCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  background = 'transparent',
  className = "",
  style,
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
      style={style}
    >
      {/* Header com título e ícone */}
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-sm font-medium"
          style={{ 
            color: (style as Record<string, string | undefined>)?.['--foreground'] 
              ? `${(style as Record<string, string | undefined>)['--foreground']}E6` // 90% opacity (E6 = 230/255 ≈ 0.9)
              : 'var(--on-background)'
          }}
        >
          {title}
        </h3>
        <div className="p-2 bg-[var(--primary)] rounded-full">
          <Icon size={20} className="text-[var(--on-primary)]" />
        </div>
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        <p 
          className="text-2xl font-bold"
          style={{ 
            color: (style as Record<string, string | undefined>)?.['--foreground'] 
              ? `${(style as Record<string, string | undefined>)['--foreground']}E6` // 90% opacity
              : 'var(--foreground)'
          }}
        >
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
          <span 
            className="text-sm"
            style={{ 
              color: (style as Record<string, string | undefined>)?.['--foreground'] 
                ? `${(style as Record<string, string | undefined>)['--foreground']}E6` // 90% opacity
                : 'var(--on-background)'
            }}
          >
            vs mês anterior
          </span>
        </div>
      )}
    </div>
  );
}
