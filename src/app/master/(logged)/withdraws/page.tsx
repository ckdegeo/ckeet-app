'use client';

import { useState } from 'react';
import { Eye, Check, X, Clock, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import Table from '@/app/components/tables/table';
import DatePicker from '@/app/components/selectors/datePicker';
import Search from '@/app/components/inputs/search';
import NumberCard from '@/app/components/cards/numberCard';
import ValueCard from '@/app/components/cards/valueCard';
import Tabs from '@/app/components/tabs/tabs';

interface Withdraw {
  id: string;
  sellerName: string;
  sellerEmail: string;
  storeName: string;
  storeId: string;
  amount: number;
  amountFormatted: string;
  requestDate: string;
  requestTime: string;
  status: string;
  bankAccount: string;
  pixKey: string;
  document: string;
  availableBalance: number;
  rejectionReason?: string;
}

interface Column {
  key: keyof Withdraw;
  label: string;
  width: string;
  render?: (value: unknown) => string;
}

export default function Withdraws() {
  const [withdraws] = useState<Withdraw[]>([
    {
      id: 'WD001',
      sellerName: 'João Silva Santos',
      sellerEmail: 'joao@techstore.com',
      storeName: 'Tech Store SP',
      storeId: '1',
      amount: 5420.50,
      amountFormatted: 'R$ 5.420,50',
      requestDate: '15/01/2024',
      requestTime: '14:30',
      status: 'Pendente',
      bankAccount: 'Banco do Brasil - Ag: 1234 - CC: 12345-6',
      pixKey: 'joao.silva@email.com',
      document: '123.456.789-00',
      availableBalance: 8750.00
    },
    {
      id: 'WD002',
      sellerName: 'Maria Oliveira Costa',
      sellerEmail: 'maria@fashionboutique.com',
      storeName: 'Fashion Boutique',
      storeId: '2',
      amount: 2840.30,
      amountFormatted: 'R$ 2.840,30',
      requestDate: '15/01/2024',
      requestTime: '16:45',
      status: 'Pendente',
      bankAccount: 'Itaú - Ag: 5678 - CP: 98765-4',
      pixKey: '(11) 99999-9999',
      document: '987.654.321-00',
      availableBalance: 4200.50
    },
    {
      id: 'WD003',
      sellerName: 'Ana Paula Rodrigues',
      sellerEmail: 'ana@sportscenter.com',
      storeName: 'Sports Center',
      storeId: '4',
      amount: 1250.00,
      amountFormatted: 'R$ 1.250,00',
      requestDate: '14/01/2024',
      requestTime: '10:15',
      status: 'Aprovado',
      bankAccount: 'Bradesco - Ag: 9876 - CC: 54321-0',
      pixKey: 'ana.paula@email.com',
      document: '456.789.123-00',
      availableBalance: 3100.75
    },
    {
      id: 'WD004',
      sellerName: 'Carlos Eduardo Lima',
      sellerEmail: 'carlos@casadecoracao.com',
      storeName: 'Casa & Decoração',
      storeId: '3',
      amount: 3750.80,
      amountFormatted: 'R$ 3.750,80',
      requestDate: '14/01/2024',
      requestTime: '09:20',
      status: 'Rejeitado',
      bankAccount: 'Santander - Ag: 1111 - CC: 77777-8',
      pixKey: 'carlos.lima@email.com',
      document: '789.123.456-00',
      availableBalance: 2800.00,
      rejectionReason: 'Documentação incompleta'
    },
    {
      id: 'WD005',
      sellerName: 'Roberto Santos Filho',
      sellerEmail: 'roberto@eletronicosplus.com',
      storeName: 'Eletrônicos Plus',
      storeId: '5',
      amount: 6890.20,
      amountFormatted: 'R$ 6.890,20',
      requestDate: '13/01/2024',
      requestTime: '18:30',
      status: 'Pendente',
      bankAccount: 'Caixa - Ag: 2222 - CP: 88888-9',
      pixKey: '11987654321',
      document: '321.654.987-00',
      availableBalance: 12500.40
    }
  ]);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Filtrar saques por status
  const pendingWithdraws = withdraws.filter(w => w.status === 'Pendente');
  const approvedWithdraws = withdraws.filter(w => w.status === 'Aprovado');
  
  const totalPendingAmount = pendingWithdraws.reduce((total, w) => total + w.amount, 0);
  const totalApprovedAmount = approvedWithdraws.reduce((total, w) => total + w.amount, 0);

  // Handlers para ações
  const handleViewWithdraw = () => {
    console.log('Ver detalhes do saque');
  };

  const handleApproveWithdraw = () => {
    console.log('Aprovar saque');
    // Implementar lógica de aprovação
  };

  const handleRejectWithdraw = () => {
    console.log('Rejeitar saque');
    // Implementar lógica de rejeição
  };

  // Configuração das colunas (mesma para ambas as tabelas)
  const columns: Column[] = [
    {
      key: 'storeName',
      label: 'Loja',
      width: 'w-[140px]'
    },
    {
      key: 'sellerName',
      label: 'Seller',
      width: 'w-[150px]'
    },
    {
      key: 'amountFormatted',
      label: 'Valor',
      width: 'w-[100px]'
    },
    {
      key: 'requestDate',
      label: 'Data Pedido',
      width: 'w-[130px]'
    },
    {
      key: 'bankAccount',
      label: 'Conta Bancária',
      width: 'w-[200px]'
    },
    {
      key: 'pixKey',
      label: 'Chave PIX',
      width: 'w-[160px]'
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-[100px]'
    }
  ];

  // Ações para saques pendentes
  const pendingActions = [
    {
      icon: Eye,
      label: 'Ver detalhes',
      onClick: handleViewWithdraw,
      color: 'primary'
    },
    {
      icon: Check,
      label: 'Aprovar saque',
      onClick: handleApproveWithdraw,
      color: 'secondary'
    },
    {
      icon: X,
      label: 'Rejeitar saque',
      onClick: handleRejectWithdraw,
      color: 'error'
    }
  ];

  // Ações para saques aprovados (apenas visualizar)
  const approvedActions = [
    {
      icon: Eye,
      label: 'Ver detalhes',
      onClick: handleViewWithdraw,
      color: 'primary'
    }
  ];

  // Configuração das tabs
  const tabItems = [
    {
      id: 'pending',
      label: `Pendentes (${pendingWithdraws.length})`,
      icon: Clock,
      content: (
        <Table
          data={pendingWithdraws}
          columns={columns}
          actions={pendingActions}
          itemsPerPage={10}
          emptyMessage="Nenhum saque pendente encontrado"
        />
      )
    },
    {
      id: 'approved',
      label: `Aprovados (${approvedWithdraws.length})`,
      icon: CheckCircle,
      content: (
        <Table
          data={approvedWithdraws}
          columns={columns}
          actions={approvedActions}
          itemsPerPage={10}
          emptyMessage="Nenhum saque aprovado encontrado"
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Saques
          </h1>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberCard
            title="Pendentes"
            value={pendingWithdraws.length}
            icon={Clock}
            change={12}
            changeType="increase"
          />
          
          <ValueCard
            title="Valor Pendente"
            value={totalPendingAmount}
            currency="BRL"
            icon={AlertTriangle}
            change={8}
            changeType="increase"
            background="secondary"
          />

          <NumberCard
            title="Aprovados"
            value={approvedWithdraws.length}
            icon={CheckCircle}
            change={15}
            changeType="increase"
          />

          <ValueCard
            title="Valor Aprovado"
            value={totalApprovedAmount}
            currency="BRL"
            icon={CreditCard}
            change={22}
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
              placeholder="Buscar por loja, seller ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs com as tabelas */}
      <Tabs
        items={tabItems}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}