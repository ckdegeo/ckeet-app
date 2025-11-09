'use client';

import { useEffect, useState } from 'react';
import NumberCard from "@/app/components/cards/numberCard";
import Table from "@/app/components/tables/table";
import Search from "@/app/components/inputs/search";
import { Users } from "lucide-react";
import { getAccessToken } from '@/lib/utils/authUtils';
import { showToastWithAutoClose } from '@/lib/utils/toastUtils';
import MasterClientsSkeleton from '@/app/components/master/clientsSkeleton';

// Interface para os dados dos clientes
interface Client {
  id: string;
  nomeCliente: string;
  email: string;
  telefone: string;
  status: 'ACTIVE' | 'BANNED';
  dataCriacao: string;
  
  // Dados da loja
  lojaNome: string;
  lojaSubdomain: string | null;
  lojaContactEmail: string | null;
  
  // Dados do seller
  sellerId: string | null;
  sellerNome: string;
  sellerEmail: string;
  sellerTelefone: string;
  
  // Métricas
  totalPedidos: number;
  pedidosPagos: number;
  totalGasto: number;
  totalCompras: number;
}
// Dados para os cards (atualizados via API)
const initialCards = {
  totalClientes: 0,
  clientesAtivos: 0
};

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [cards, setCards] = useState(initialCards);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar clientes da API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const token = getAccessToken();
        const res = await fetch('/api/master/clients', {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        const json = await res.json();
        if (res.ok && json?.data) {
          setClients(json.data);
          setFilteredClients(json.data);
          setCards({
            totalClientes: json.totals?.totalClientes || json.data.length,
            clientesAtivos: json.totals?.clientesAtivos || 0
          });
        } else {
          showToastWithAutoClose('error', json.error || 'Erro ao carregar clientes', 4000);
        }
      } catch (e) {
        console.error('Erro ao carregar clientes:', e);
        showToastWithAutoClose('error', 'Erro ao carregar clientes', 4000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Função para filtrar clientes com base no termo de pesquisa
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredClients(clients);
      return;
    }
    
    const filtered = clients.filter(client => 
      client.nomeCliente.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.lojaNome.toLowerCase().includes(term) ||
      client.sellerNome.toLowerCase().includes(term) ||
      client.sellerEmail.toLowerCase().includes(term) ||
      client.telefone.includes(term) ||
      client.sellerTelefone.includes(term)
    );
    
    setFilteredClients(filtered);
  };

  const columns = [
    {
      key: 'nomeCliente' as keyof Client,
      label: 'Nome do Cliente',
      width: 'w-[200px]'
    },
    {
      key: 'email' as keyof Client,
      label: 'E-mail',
      width: 'w-[220px]'
    },
    {
      key: 'telefone' as keyof Client,
      label: 'Telefone',
      width: 'w-[140px]'
    },
    {
      key: 'status' as keyof Client,
      label: 'Status',
      width: 'w-[120px]',
      render: (value: unknown) => {
        const status = String(value);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status === 'ACTIVE' ? 'Ativo' : 'Banido'}
          </span>
        );
      }
    },
    {
      key: 'lojaNome' as keyof Client,
      label: 'Loja',
      width: 'w-[180px]'
    },
    {
      key: 'sellerNome' as keyof Client,
      label: 'Vendedor',
      width: 'w-[180px]'
    },
    {
      key: 'sellerEmail' as keyof Client,
      label: 'E-mail Vendedor',
      width: 'w-[200px]'
    },
    {
      key: 'totalPedidos' as keyof Client,
      label: 'Total Pedidos',
      width: 'w-[120px]',
      render: (value: unknown) => {
        const pedidos = Number(value);
        return <span>{pedidos}</span>;
      }
    },
    {
      key: 'pedidosPagos' as keyof Client,
      label: 'Pedidos Pagos',
      width: 'w-[130px]',
      render: (value: unknown) => {
        const pagos = Number(value);
        return <span>{pagos}</span>;
      }
    },
    {
      key: 'totalGasto' as keyof Client,
      label: 'Total Gasto',
      width: 'w-[140px]',
      render: (value: unknown) => {
        const total = Number(value);
        return (
          <span>
            {total.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </span>
        );
      }
    },
    {
      key: 'dataCriacao' as keyof Client,
      label: 'Data de Cadastro',
      width: 'w-[160px]',
      render: (value: unknown) => {
        const dateValue = String(value);
        const d = new Date(dateValue);
        return d.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  ];

  if (isLoading) {
    return <MasterClientsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Clientes
          </h1>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberCard
            title="Clientes"
            value={cards.totalClientes}
            icon={Users}
            change={15}
            changeType="increase"
          />
          
          <NumberCard
            title="Ativos"
            value={cards.clientesAtivos}
            icon={Users}
            change={8}
            changeType="increase"
            background="transparent"
          />
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-[400px]">
            <Search
              placeholder="Pesquisar por nome, email, loja ou vendedor..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Tabela de clientes */}
      <Table
        data={filteredClients}
        columns={columns}
        itemsPerPage={10}
        emptyMessage="Nenhum cliente encontrado"
      />
    </div>
  );
}