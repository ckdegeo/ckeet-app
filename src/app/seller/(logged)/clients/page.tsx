'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import Table from '@/app/components/tables/table';
import Selector from '@/app/components/selectors/selector';
import Search from '@/app/components/inputs/search';
import NumberCard from '@/app/components/cards/numberCard';
import { Users, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '@/app/components/ui/badge';
import BanCustomerModal from '@/app/components/modals/banCustomerModal';

type PeriodOption = 'today' | 'week' | 'month' | 'year' | 'all';

// Interface para os dados de clientes
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
  totalOrders: number;
  totalPurchases: number;
  totalSpent: number;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [period, setPeriod] = useState<PeriodOption>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [unbanModalOpen, setUnbanModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Calcular range de datas baseado no período selecionado
  const getDateRange = (period: PeriodOption): [Date, Date] => {
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
        startDate = new Date('1900-01-01');
        break;
    }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return [startDate, endDate];
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('Por favor, faça login novamente');
        window.location.href = '/seller/auth/login';
        return;
      }

      const [startDate, endDate] = getDateRange(period);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const params = new URLSearchParams();
      params.append('startDate', startDateStr);
      params.append('endDate', endDateStr);

      const response = await fetch(`/api/seller/customers?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar clientes');
      }

      const data = await response.json();
      setClients(data.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Filtrar clientes por termo de busca
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.toLowerCase().includes(searchLower)
    );
  });

  // Calcular estatísticas
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'ACTIVE').length;
  const bannedClients = clients.filter(client => client.status === 'BANNED').length;

  // Função para formatar data e hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para formatar status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Ativo',
      'BANNED': 'Banido'
    };
    return statusMap[status] || status;
  };

  // Função para formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Handlers para ações
  const handleBanClient = (client: Client) => {
    setSelectedClient(client);
    setBanModalOpen(true);
  };

  const handleUnbanClient = (client: Client) => {
    setSelectedClient(client);
    setUnbanModalOpen(true);
  };

  const handleConfirmBan = async () => {
    if (!selectedClient) return;

    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('Por favor, faça login novamente');
        return;
      }

      const response = await fetch('/api/seller/customers/ban', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customerId: selectedClient.id })
      });

      if (!response.ok) {
        throw new Error('Erro ao banir cliente');
      }

      toast.success('Cliente banido com sucesso');
      setBanModalOpen(false);
      setSelectedClient(null);
      fetchClients(); // Atualizar lista
    } catch (error) {
      console.error('Erro ao banir cliente:', error);
      toast.error('Erro ao banir cliente');
    }
  };

  const handleConfirmUnban = async () => {
    if (!selectedClient) return;

    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('Por favor, faça login novamente');
        return;
      }

      const response = await fetch('/api/seller/customers/unban', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ customerId: selectedClient.id })
      });

      if (!response.ok) {
        throw new Error('Erro ao desbanir cliente');
      }

      toast.success('Cliente desbanido com sucesso');
      setUnbanModalOpen(false);
      setSelectedClient(null);
      fetchClients(); // Atualizar lista
    } catch (error) {
      console.error('Erro ao desbanir cliente:', error);
      toast.error('Erro ao desbanir cliente');
    }
  };

  // Configuração das colunas
  const columns = [
    {
      key: 'name' as keyof Client,
      label: 'Nome',
      width: 'w-[200px]'
    },
    {
      key: 'email' as keyof Client,
      label: 'Email',
      width: 'w-[200px]'
    },
    {
      key: 'phone' as keyof Client,
      label: 'Telefone',
      width: 'w-[140px]'
    },
    {
      key: 'totalOrders' as keyof Client,
      label: 'Pedidos',
      width: 'w-[100px]'
    },
    {
      key: 'totalSpent' as keyof Client,
      label: 'Total Gasto',
      width: 'w-[120px]',
      render: (value: unknown) => formatCurrency(value as number)
    },
    {
      key: 'createdAt' as keyof Client,
      label: 'Data de Criação',
      width: 'w-[160px]',
      render: (value: unknown) => formatDateTime(value as string)
    },
    {
      key: 'status' as keyof Client,
      label: 'Status',
      width: 'w-[100px]',
      render: (value: unknown) => <Badge status={formatStatus(value as string)} />
    }
  ];

  // Configuração das ações
  const actions = [
    {
      icon: Shield,
      label: 'Banir cliente',
      onClick: handleBanClient,
      color: 'error',
      show: (client: Client) => client.status === 'ACTIVE'
    },
    {
      icon: ShieldOff,
      label: 'Desbanir cliente',
      onClick: handleUnbanClient,
      color: 'secondary',
      show: (client: Client) => client.status === 'BANNED'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Clientes
          </h1>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberCard
            title="Total de Clientes"
            value={totalClients}
            icon={Users}
            change={0}
            changeType="increase"
          />
          
          <NumberCard
            title="Ativos"
            value={activeClients}
            icon={UserCheck}
            change={0}
            changeType="increase"
          />

          <NumberCard
            title="Banidos"
            value={bannedClients}
            icon={UserX}
            change={0}
            changeType="increase"
            background="transparent"
          />
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-auto sm:min-w-[280px]">
            <Selector
              value={period}
              onChange={(value) => setPeriod(value as PeriodOption)}
              options={[
                { value: 'today', label: 'Hoje' },
                { value: 'week', label: 'Últimos 7 dias' },
                { value: 'month', label: 'Último mês' },
                { value: 'year', label: 'Último ano' },
                { value: 'all', label: 'Todo período' }
              ]}
            />
          </div>
          
          <div className="w-full sm:w-[400px]">
            <Search
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de clientes */}
      <div className="flex-1 min-h-0 md:min-h-[500px]">
        <Table
          data={filteredClients}
          columns={columns}
          actions={actions}
          itemsPerPage={10}
          emptyMessage="Nenhum cliente encontrado"
        />
      </div>

      {/* Modal de Banimento */}
      {selectedClient && banModalOpen && (
        <BanCustomerModal
          isOpen={banModalOpen}
          onClose={() => {
            setBanModalOpen(false);
            setSelectedClient(null);
          }}
          onConfirm={async () => await handleConfirmBan()}
          customerName={selectedClient.name}
          action="ban"
        />
      )}

      {/* Modal de Desbanimento */}
      {selectedClient && unbanModalOpen && (
        <BanCustomerModal
          isOpen={unbanModalOpen}
          onClose={() => {
            setUnbanModalOpen(false);
            setSelectedClient(null);
          }}
          onConfirm={async () => await handleConfirmUnban()}
          customerName={selectedClient.name}
          action="unban"
        />
      )}
    </div>
  );
}

