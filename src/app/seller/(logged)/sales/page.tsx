'use client';

import { useState } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import Table from '@/app/components/tables/table';
import DatePicker from '@/app/components/selectors/datePicker';
import Search from '@/app/components/inputs/search';
import NumberCard from '@/app/components/cards/numberCard';
import { Clock, CheckCircle, BarChart2 } from 'lucide-react';

// Interface para os dados de vendas
interface Sale {
  id: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  paymentDate: string;
  paymentTime: string;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'transfer';
  amount: number;
}

// Dados de exemplo
const sampleSales: Sale[] = [
  {
    id: '001',
    productName: 'Smartphone XYZ',
    customerName: 'João Silva',
    customerEmail: 'joao.silva@email.com',
    paymentDate: '2024-01-15',
    paymentTime: '14:30',
    status: 'completed',
    paymentMethod: 'credit_card',
    amount: 1299.90
  },
  {
    id: '002',
    productName: 'Fone de Ouvido Bluetooth',
    customerName: 'Maria Santos',
    customerEmail: 'maria.santos@email.com',
    paymentDate: '2024-01-15',
    paymentTime: '16:45',
    status: 'pending',
    paymentMethod: 'pix',
    amount: 199.90
  },
  {
    id: '003',
    productName: 'Smartwatch',
    customerName: 'Pedro Oliveira',
    customerEmail: 'pedro.oliveira@email.com',
    paymentDate: '2024-01-14',
    paymentTime: '10:15',
    status: 'completed',
    paymentMethod: 'debit_card',
    amount: 499.90
  },
  {
    id: '004',
    productName: 'Camiseta Básica',
    customerName: 'Ana Costa',
    customerEmail: 'ana.costa@email.com',
    paymentDate: '2024-01-14',
    paymentTime: '09:20',
    status: 'cancelled',
    paymentMethod: 'boleto',
    amount: 49.90
  },
  {
    id: '005',
    productName: 'Calça Jeans',
    customerName: 'Carlos Ferreira',
    customerEmail: 'carlos.ferreira@email.com',
    paymentDate: '2024-01-13',
    paymentTime: '18:30',
    status: 'refunded',
    paymentMethod: 'credit_card',
    amount: 129.90
  },
  {
    id: '006',
    productName: 'Smartphone XYZ',
    customerName: 'Lucia Mendes',
    customerEmail: 'lucia.mendes@email.com',
    paymentDate: '2024-01-13',
    paymentTime: '11:45',
    status: 'completed',
    paymentMethod: 'transfer',
    amount: 1299.90
  },
  {
    id: '007',
    productName: 'Fone de Ouvido Bluetooth',
    customerName: 'Roberto Lima',
    customerEmail: 'roberto.lima@email.com',
    paymentDate: '2024-01-12',
    paymentTime: '15:10',
    status: 'pending',
    paymentMethod: 'pix',
    amount: 199.90
  }
];

// Interface para os dados do dashboard
interface DashboardData {
  ordens: {
    pendentes: number;
    aprovadas: number;
  };
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>(sampleSales);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchTerm, setSearchTerm] = useState('');

  // Calcula os dados do dashboard baseado nas vendas
  const totalOrdens = sales.length;
  const ordensAprovadas = sales.filter(sale => sale.status === 'completed').length;
  const ordensPendentes = sales.filter(sale => sale.status === 'pending').length;
  const taxaConversao = (ordensAprovadas / totalOrdens) * 100;

  const dashboardData: DashboardData = {
    ordens: {
      pendentes: ordensPendentes,
      aprovadas: ordensAprovadas,
    }
  };

  // Função para formatar data e hora
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para formatar status
  const formatStatus = (status: Sale['status']) => {
    const statusMap = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return statusMap[status];
  };

  // Função para formatar forma de pagamento
  const formatPaymentMethod = (method: Sale['paymentMethod']) => {
    const methodMap = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      transfer: 'Transferência'
    };
    return methodMap[method];
  };

  // Função para formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Handlers para ações
  const handleViewSale = (sale: Sale) => {
    console.log('Visualizar venda:', sale);
    // Implementar modal ou página de detalhes da venda
  };

  const handleRefund = (sale: Sale) => {
    console.log('Processar reembolso:', sale);
    // Implementar lógica de reembolso
    setSales(prevSales => 
      prevSales.map(s => 
        s.id === sale.id 
          ? { ...s, status: 'refunded' as const }
          : s
      )
    );
  };

  // Configuração das colunas
  const columns = [
    {
      key: 'productName' as keyof Sale,
      label: 'Produto',
      width: 'w-[200px]'
    },
    {
      key: 'customerName' as keyof Sale,
      label: 'Cliente',
      width: 'w-[150px]'
    },
    {
      key: 'customerEmail' as keyof Sale,
      label: 'Email',
      width: 'w-[200px]'
    },
    {
      key: 'paymentDate' as keyof Sale,
      label: 'Data e Hora',
      width: 'w-[140px]',
      render: (value: unknown) => {
        const sale = sales.find(s => s.paymentDate === value);
        return sale ? formatDateTime(sale.paymentDate, sale.paymentTime) : String(value);
      }
    },
    {
      key: 'status' as keyof Sale,
      label: 'Status',
      width: 'w-[120px]',
      render: (value: unknown) => formatStatus(value as Sale['status'])
    },
    {
      key: 'paymentMethod' as keyof Sale,
      label: 'Forma de Pagamento',
      width: 'w-[160px]',
      render: (value: unknown) => formatPaymentMethod(value as Sale['paymentMethod'])
    },
    {
      key: 'amount' as keyof Sale,
      label: 'Valor',
      width: 'w-[100px]',
      render: (value: unknown) => formatCurrency(value as number)
    }
  ];

  // Configuração das ações
  const actions = [
    {
      icon: Eye,
      label: 'Visualizar detalhes da venda',
      onClick: handleViewSale,
      color: 'primary'
    },
    {
      icon: RotateCcw,
      label: 'Processar reembolso',
      onClick: handleRefund,
      color: 'error',
      show: (sale: Sale) => sale.status === 'completed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Vendas
          </h1>
        </div>

        {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberCard
           title="Ordens Pendentes"
           value={ordensPendentes}
           icon={Clock}
           change={ordensPendentes - 2} // Exemplo: comparação com período anterior
           changeType="decrease"
         />
         
         <NumberCard
           title="Ordens Aprovadas"
           value={ordensAprovadas}
           icon={CheckCircle}
           change={ordensAprovadas - 5} // Exemplo: comparação com período anterior
           changeType="increase"
         />

         <NumberCard
           title="Taxa de Conversão"
           value={`${taxaConversao.toFixed(1)}%`}
           icon={BarChart2}
           change={1.5} // Exemplo: comparação com período anterior
           changeType="increase"
           background="colored"
         />
      </div>

        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-auto sm:min-w-[280px]">
            <DatePicker
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={setDateRange}
            />
          </div>
          
          <div className="w-full sm:w-[400px]">
            <Search
              placeholder="Buscar por produto, cliente ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de vendas */}
      <Table
        data={sales}
        columns={columns}
        actions={actions}
        itemsPerPage={10}
        emptyMessage="Nenhuma venda encontrada"
      />
    </div>
  );
}
