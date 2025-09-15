'use client';

import { useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import Table from '@/app/components/tables/table';
import DatePicker from '@/app/components/selectors/datePicker';
import Search from '@/app/components/inputs/search';
import NumberCard from '@/app/components/cards/numberCard';
import { Users, UserCheck, UserX } from 'lucide-react';

// Interface para os dados de clientes
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  createdDate: string;
  createdTime: string;
  status: 'active' | 'banned';
}

// Dados de exemplo
const sampleClients: Client[] = [
  {
    id: '001',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    cpf: '123.456.789-01',
    createdDate: '2024-01-10',
    createdTime: '09:30',
    status: 'active'
  },
  {
    id: '002',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 98888-2222',
    cpf: '234.567.890-12',
    createdDate: '2024-01-12',
    createdTime: '14:15',
    status: 'active'
  },
  {
    id: '003',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 97777-3333',
    cpf: '345.678.901-23',
    createdDate: '2024-01-08',
    createdTime: '16:45',
    status: 'banned'
  },
  {
    id: '004',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 96666-4444',
    cpf: '456.789.012-34',
    createdDate: '2024-01-15',
    createdTime: '11:20',
    status: 'active'
  },
  {
    id: '005',
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    phone: '(11) 95555-5555',
    cpf: '567.890.123-45',
    createdDate: '2024-01-05',
    createdTime: '10:10',
    status: 'active'
  },
  {
    id: '006',
    name: 'Lucia Mendes',
    email: 'lucia.mendes@email.com',
    phone: '(11) 94444-6666',
    cpf: '678.901.234-56',
    createdDate: '2024-01-18',
    createdTime: '13:30',
    status: 'active'
  },
  {
    id: '007',
    name: 'Roberto Lima',
    email: 'roberto.lima@email.com',
    phone: '(11) 93333-7777',
    cpf: '789.012.345-67',
    createdDate: '2024-01-20',
    createdTime: '15:45',
    status: 'banned'
  }
];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchTerm, setSearchTerm] = useState('');

  // Calcula os dados do dashboard baseado nos clientes
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const bannedClients = clients.filter(client => client.status === 'banned').length;

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
  const formatStatus = (status: Client['status']) => {
    const statusMap = {
      active: 'Ativo',
      banned: 'Banido'
    };
    return statusMap[status];
  };

  // Handlers para ações
  const handleBanClient = (client: Client) => {
    console.log('Banir cliente:', client);
    setClients(prevClients => 
      prevClients.map(c => 
        c.id === client.id 
          ? { ...c, status: 'banned' as const }
          : c
      )
    );
  };

  const handleUnbanClient = (client: Client) => {
    console.log('Desbanir cliente:', client);
    setClients(prevClients => 
      prevClients.map(c => 
        c.id === client.id 
          ? { ...c, status: 'active' as const }
          : c
      )
    );
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
      key: 'cpf' as keyof Client,
      label: 'CPF',
      width: 'w-[140px]'
    },
    {
      key: 'createdDate' as keyof Client,
      label: 'Data de Criação',
      width: 'w-[160px]',
      render: (value: unknown) => {
        const client = clients.find(c => c.createdDate === value);
        return client ? formatDateTime(client.createdDate, client.createdTime) : String(value);
      }
    },
    {
      key: 'status' as keyof Client,
      label: 'Status',
      width: 'w-[100px]',
      render: (value: unknown) => formatStatus(value as Client['status'])
    }
  ];

  // Configuração das ações
  const actions = [
    {
      icon: Shield,
      label: 'Banir cliente',
      onClick: handleBanClient,
      color: 'error',
      show: (client: Client) => client.status === 'active'
    },
    {
      icon: ShieldOff,
      label: 'Desbanir cliente',
      onClick: handleUnbanClient,
      color: 'secondary',
      show: (client: Client) => client.status === 'banned'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4">
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
            change={totalClients - 15} // Exemplo: comparação com período anterior
            changeType="increase"
          />
          
          <NumberCard
            title="Clientes Ativos"
            value={activeClients}
            icon={UserCheck}
            change={activeClients - 12} // Exemplo: comparação com período anterior
            changeType="increase"
          />

          <NumberCard
            title="Clientes Banidos"
            value={bannedClients}
            icon={UserX}
            change={bannedClients - 1} // Exemplo: comparação com período anterior
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
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de clientes */}
      <Table
        data={clients}
        columns={columns}
        actions={actions}
        itemsPerPage={10}
        emptyMessage="Nenhum cliente encontrado"
      />
    </div>
  );
}   