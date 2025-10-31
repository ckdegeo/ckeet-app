'use client';

interface BadgeProps {
  status: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function Badge({ status, primaryColor = '#bd253c', secondaryColor = '#970b27' }: BadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
      case 'paid':
        return {
          text: 'Pago',
          bgColor: '#10b981',
          textColor: 'white',
          borderColor: '#059669'
        };
      case 'pendente':
      case 'pending':
        return {
          text: 'Pendente',
          bgColor: '#f59e0b',
          textColor: 'white',
          borderColor: '' // Sem borda para pendente
        };
      case 'entregue':
      case 'delivered':
        return {
          text: 'Entregue',
          bgColor: '#3b82f6',
          textColor: 'white',
          borderColor: '#2563eb'
        };
      case 'cancelado':
      case 'cancelled':
        return {
          text: 'Cancelado',
          bgColor: '#ef4444',
          textColor: 'white',
          borderColor: '#dc2626'
        };
      case 'reembolsado':
      case 'refunded':
        return {
          text: 'Reembolsado',
          bgColor: '#6b7280',
          textColor: 'white',
          borderColor: '#4b5563'
        };
      default:
        return {
          text: status,
          bgColor: primaryColor,
          textColor: 'white',
          borderColor: secondaryColor
        };
    }
  };

  const config = getStatusConfig(status);
  const isPending = status.toLowerCase() === 'pendente' || status.toLowerCase() === 'pending';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPending ? '' : 'border'}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        ...(isPending ? {} : { borderColor: config.borderColor })
      }}
    >
      {config.text}
    </span>
  );
}
