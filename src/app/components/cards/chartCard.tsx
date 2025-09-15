'use client';

import { LucideIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface ChartDataPoint {
  value: number;
  label?: string;
}

interface ChartCardProps {
  title: string;
  value: number;
  currency: 'BRL' | 'USD' | 'EUR';
  icon: LucideIcon;
  change?: number;
  changeType?: 'increase' | 'decrease';
  background?: 'transparent' | 'secondary';
  chartData: ChartDataPoint[];
  chartType?: 'line' | 'area' | 'bar';
  className?: string;
}

const currencyConfig = {
  BRL: { symbol: 'R$', locale: 'pt-BR' },
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' }
};

export default function ChartCard({
  title,
  value,
  currency,
  icon: Icon,
  change,
  changeType,
  background = 'transparent',
  chartData,
  chartType = 'line',
  className = "",
}: ChartCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currencyConfig[currency].locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getChartColor = () => {
    if (changeType === 'increase') return '#10b981'; // green-500
    if (changeType === 'decrease') return '#ef4444'; // red-500
    return 'var(--primary)'; // primary color
  };

  const renderChart = () => {
    const chartColor = getChartColor();
    
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartData}>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor}
                fill={chartColor}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={chartData}>
              <Bar 
                dataKey="value" 
                fill={chartColor}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      default: // line
        return (
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: chartColor }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

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
      <div className="mb-3">
        <p className="text-2xl font-bold text-[var(--foreground)]">
          {formatCurrency(value)}
        </p>
      </div>

      {/* Mini Chart */}
      <div className="mb-3 -mx-2">
        {renderChart()}
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
            {changeType === 'increase' ? '+' : '-'}{Math.abs(change)}%
          </span>
          <span className="text-sm text-[var(--on-background)]">
            vs mês anterior
          </span>
        </div>
      )}
    </div>
  );
}