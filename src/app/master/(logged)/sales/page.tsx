'use client';

import { useState } from 'react';
import { Eye, RotateCcw, ExternalLink } from 'lucide-react';
import Table from '@/app/components/tables/table';
import DatePicker from '@/app/components/selectors/datePicker';
import Search from '@/app/components/inputs/search';
import NumberCard from '@/app/components/cards/numberCard';
import ValueCard from '@/app/components/cards/valueCard';
import { Clock, CheckCircle, BarChart2, DollarSign, Store } from 'lucide-react';

// Interface para os dados de vendas do master
interface MasterSale {
  id: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  paymentDate: string;
  paymentTime: string;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'transfer';
  amount: number;
  // Dados da loja
  storeName: string;
  sellerName: string;
  sellerEmail: string;
  storeCommission: number;
  storeId: string;
}

// Dados de exemplo com informações das lojas
const sampleMasterSales: MasterSale[] = [
  {
    id: '001',
    productName: 'Smartphone XYZ',
    customerName: 'João Silva',
    customerEmail: 'joao.silva@email.com',
    paymentDate: '2024-01-15',
    paymentTime: '14:30',
    status: 'completed',
    paymentMethod: 'credit_card',
    amount: 1299.90,
    storeName: 'Tech Store SP',
    sellerName: 'João Silva Santos',
    sellerEmail: 'joao@techstore.com',
    storeCommission: 64.99, // 5% da venda
    storeId: '1'
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
    amount: 199.90,
    storeName: 'Fashion Boutique',
    sellerName: 'Maria Oliveira Costa',
    sellerEmail: 'maria@fashionboutique.com',
    storeCommission: 9.99,
    storeId: '2'
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
    amount: 499.90,
    storeName: 'Sports Center',
    sellerName: 'Ana Paula Rodrigues',
    sellerEmail: 'ana@sportscenter.com',
    storeCommission: 24.99,
    storeId: '4'
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
    amount: 49.90,
    storeName: 'Fashion Boutique',
    sellerName: 'Maria Oliveira Costa',
    sellerEmail: 'maria@fashionboutique.com',
    storeCommission: 2.49,
    storeId: '2'
  },
  {
    id: '005',
    productName: 'Notebook Gamer',
    customerName: 'Carlos Ferreira',
    customerEmail: 'carlos.ferreira@email.com',
    paymentDate: '2024-01-13',
    paymentTime: '18:30',
    status: 'refunded',
    paymentMethod: 'credit_card',
    amount: 2299.90,
    storeName: 'Eletrônicos Plus',
    sellerName: 'Roberto Santos Filho',
    sellerEmail: 'roberto@eletronicosplus.com',
    storeCommission: 114.99,
    storeId: '5'
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
    amount: 1299.90,
    storeName: 'Tech Store SP',
    sellerName: 'João Silva Santos',
    sellerEmail: 'joao@techstore.com',
    storeCommission: 64.99,
    storeId: '1'
  },
  {
    id: '007',
    productName: 'Sofá 3 Lugares',
    customerName: 'Roberto Lima',
    customerEmail: 'roberto.lima@email.com',
    paymentDate: '2024-01-12',
    paymentTime: '15:10',
    status: 'pending',
    paymentMethod: 'pix',
    amount: 899.90,
    storeName: 'Casa & Decoração',
    sellerName: 'Carlos Eduardo Lima',
    sellerEmail: 'carlos@casadecoracao.com',
    storeCommission: 44.99,
    storeId: '3'
  }
];

export default function Sales() {
  const [allSales] = useState<MasterSale[]>(sampleMasterSales);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra apenas vendas concluídas (pagas)
  const sales = allSales.filter(sale => sale.status === 'completed');

  // Calcula os dados do dashboard baseado apenas nas vendas concluídas
  const totalVendas = sales.length;
  const faturamentoTotal = sales.reduce((total, sale) => total + sale.amount, 0);
  const comissaoTotal = sales.reduce((total, sale) => total + sale.storeCommission, 0);
  const ticketMedio = totalVendas > 0 ? faturamentoTotal / totalVendas : 0;

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
  const formatStatus = (status: MasterSale['status']) => {
    const statusMap = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return statusMap[status];
  };

  // Função para formatar forma de pagamento
  const formatPaymentMethod = (method: MasterSale['paymentMethod']) => {
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
  const handleViewSale = (sale: MasterSale) => {
    console.log('Visualizar venda:', sale);
    // Implementar modal ou página de detalhes da venda
  };

  const handleRefund = (sale: MasterSale) => {
    console.log('Processar reembolso:', sale);
    // Implementar lógica de reembolso
    // Nota: Como estamos mostrando apenas vendas concluídas, 
    // o reembolso removeria a venda da lista
  };

  const handleGoToStore = (sale: MasterSale) => {
    console.log('Ir para loja:', sale.storeName);
    // Implementar navegação para a loja
  };

  // Configuração das colunas
  const columns = [
    {
      key: 'storeName' as keyof MasterSale,
      label: 'Loja',
      width: 'w-[150px]'
    },
    {
      key: 'sellerName' as keyof MasterSale,
      label: 'Seller',
      width: 'w-[150px]'
    },
    {
      key: 'productName' as keyof MasterSale,
      label: 'Produto',
      width: 'w-[160px]'
    },
    {
      key: 'customerName' as keyof MasterSale,
      label: 'Cliente',
      width: 'w-[130px]'
    },
    {
      key: 'customerEmail' as keyof MasterSale,
      label: 'E-mail do Cliente',
      width: 'w-[180px]'
    },
    {
      key: 'paymentDate' as keyof MasterSale,
      label: 'Data',
      width: 'w-[130px]',
      render: (value: unknown) => {
        const sale = sales.find(s => s.paymentDate === value);
        return sale ? formatDateTime(sale.paymentDate, sale.paymentTime) : String(value);
      }
    },
    {
      key: 'paymentMethod' as keyof MasterSale,
      label: 'Pagamento',
      width: 'w-[130px]',
      render: (value: unknown) => formatPaymentMethod(value as MasterSale['paymentMethod'])
    },
    {
      key: 'amount' as keyof MasterSale,
      label: 'Valor',
      width: 'w-[100px]',
      render: (value: unknown) => formatCurrency(value as number)
    },
    {
      key: 'storeCommission' as keyof MasterSale,
      label: 'Comissão',
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
      icon: ExternalLink,
      label: 'Ir para loja',
      onClick: handleGoToStore,
      color: 'secondary'
    },
    {
      icon: RotateCcw,
      label: 'Processar reembolso',
      onClick: handleRefund,
      color: 'error'
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

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ValueCard
            title="Faturamento Total"
            value={faturamentoTotal}
            currency="BRL"
            icon={DollarSign}
            change={15}
            changeType="increase"
          />
          
          <ValueCard
            title="Comissões"
            value={comissaoTotal}
            currency="BRL"
            icon={Store}
            change={12}
            changeType="increase"
            background="secondary"
          />

          <NumberCard
            title="Total de Vendas"
            value={totalVendas}
            icon={CheckCircle}
            change={8}
            changeType="increase"
          />

          <ValueCard
            title="Ticket Médio"
            value={ticketMedio}
            currency="BRL"
            icon={BarChart2}
            change={5.2}
            changeType="increase"
            background="transparent"
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
              placeholder="Buscar por loja, produto, cliente ou email..."
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
        emptyMessage="Nenhuma venda concluída encontrada"
      />
    </div>
  );
}   