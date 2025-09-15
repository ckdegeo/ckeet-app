'use client';

import { 
  MoreHorizontal, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Repeat,
  LucideIcon,
  CircleDollarSign,
  Euro
} from 'lucide-react';

interface Operation {
  id: string;
  type: 'received' | 'sent' | 'swapped' | 'deposit';
  name: string;
  amount: number;
  currency: 'USD' | 'EUR';
  status?: 'canceled';
  hash?: string;
  icon?: LucideIcon;
}

interface RecentOperationsProps {
  totalAmount: number;
  dailyAmount: number;
  operations: Operation[];
  className?: string;
}

export default function RecentOperations({
  totalAmount,
  dailyAmount,
  operations,
  className = ""
}: RecentOperationsProps) {
  const formatCurrency = (amount: number, currency: 'USD' | 'EUR' = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getOperationLabel = (type: Operation['type']) => {
    switch (type) {
      case 'received':
        return 'Received';
      case 'sent':
        return 'Sent';
      case 'swapped':
        return 'Swapped';
      case 'deposit':
        return `Deposit ${operations.find(op => op.type === 'deposit')?.currency?.toLowerCase() || ''}`;
      default:
        return '';
    }
  };

  return (
    <div 
      className={`
        bg-[var(--background)]
        border border-[var(--on-background)]
        rounded-2xl
        overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-medium text-[var(--foreground)]">
            Recent operations
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-[var(--secondary)]/10 text-[var(--on-background)] px-2 py-1 rounded-full">
              96T
            </span>
            <button className="text-[var(--on-background)] hover:text-[var(--foreground)]">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-[var(--foreground)]">
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-sm text-[var(--on-background)]">
            {formatCurrency(dailyAmount)} / day
          </p>
        </div>
      </div>

      {/* Lista de Operações */}
      <div className="border-t border-[var(--on-background)]">
        {operations.map((operation) => (
          <div 
            key={operation.id}
            className="flex items-center justify-between p-4 border-b border-[var(--on-background)] last:border-b-0 hover:bg-[var(--secondary)]/5"
          >
            {/* Lado Esquerdo: Ícone e Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--secondary)]/10 flex items-center justify-center">
                {operation.icon ? (
                  <operation.icon 
                    size={18} 
                    className="text-[var(--foreground)]"
                  />
                ) : operation.type === 'deposit' ? (
                  operation.currency === 'USD' ? (
                    <CircleDollarSign 
                      size={18} 
                      className="text-[var(--foreground)]"
                    />
                  ) : (
                    <Euro 
                      size={18} 
                      className="text-[var(--foreground)]"
                    />
                  )
                ) : operation.type === 'received' ? (
                  <ArrowDownLeft 
                    size={18} 
                    className="text-green-500"
                  />
                ) : operation.type === 'sent' ? (
                  <ArrowUpRight 
                    size={18} 
                    className="text-red-500"
                  />
                ) : (
                  <Repeat 
                    size={18} 
                    className="text-[var(--foreground)]"
                  />
                )}
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {operation.name}
                </p>
                <p className="text-sm text-[var(--on-background)]">
                  {getOperationLabel(operation.type)}
                </p>
              </div>
            </div>

            {/* Lado Direito: Valor e Hash */}
            <div className="text-right">
              <p className={`font-medium ${operation.status === 'canceled' ? 'text-[var(--on-background)]' : 'text-[var(--foreground)]'}`}>
                {formatCurrency(operation.amount, operation.currency)}
                {operation.status === 'canceled' && (
                  <span className="ml-2 text-xs">✕ Canceled</span>
                )}
              </p>
              {operation.hash && (
                <p className="text-sm text-[var(--on-background)] font-mono">
                  {operation.hash}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--on-background)] bg-[var(--secondary)]/5">
        <p className="text-xs text-center text-[var(--on-background)]">
          Powered by Void Solutions
        </p>
      </div>
    </div>
  );
}