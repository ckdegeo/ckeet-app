'use client';

import { useState } from 'react';
import NumberCard from "@/app/components/cards/numberCard";
import Table from "@/app/components/tables/table";
import Search from "@/app/components/inputs/search";
import { Users, Eye } from "lucide-react";

// Interface para os dados dos clientes
interface Client {
  id: number;
  nomeCliente: string;
  loja: string;
  cpf: string;
  telefone: string;
  dataCriacao: string;
}

// Dados mock para os clientes
const mockClients: Client[] = [
  {
    id: 1,
    nomeCliente: "Pedro Henrique Silva",
    loja: "Tech Store SP",
    cpf: "111.222.333-44",
    telefone: "(11) 91234-5678",
    dataCriacao: "2024-02-15"
  },
  {
    id: 2,
    nomeCliente: "Ana Carolina Santos",
    loja: "Fashion Boutique",
    cpf: "222.333.444-55",
    telefone: "(11) 98765-4321",
    dataCriacao: "2024-02-20"
  },
  {
    id: 3,
    nomeCliente: "Roberto Lima Costa",
    loja: "Casa & Decoração",
    cpf: "333.444.555-66",
    telefone: "(11) 95555-1111",
    dataCriacao: "2024-01-30"
  },
  {
    id: 4,
    nomeCliente: "Mariana Oliveira",
    loja: "Sports Center",
    cpf: "444.555.666-77",
    telefone: "(11) 94444-2222",
    dataCriacao: "2024-02-10"
  },
  {
    id: 5,
    nomeCliente: "Carlos Eduardo Pereira",
    loja: "Eletrônicos Plus",
    cpf: "555.666.777-88",
    telefone: "(11) 93333-3333",
    dataCriacao: "2024-01-25"
  },
  {
    id: 6,
    nomeCliente: "Juliana Fernandes",
    loja: "Tech Store SP",
    cpf: "666.777.888-99",
    telefone: "(11) 92222-4444",
    dataCriacao: "2024-02-18"
  },
  {
    id: 7,
    nomeCliente: "Fernando Rodrigues",
    loja: "Fashion Boutique",
    cpf: "777.888.999-00",
    telefone: "(11) 91111-5555",
    dataCriacao: "2024-02-12"
  },
  {
    id: 8,
    nomeCliente: "Patricia Almeida",
    loja: "Sports Center",
    cpf: "888.999.000-11",
    telefone: "(11) 90000-6666",
    dataCriacao: "2024-01-28"
  },
  {
    id: 9,
    nomeCliente: "Lucas Martins",
    loja: "Eletrônicos Plus",
    cpf: "999.000.111-22",
    telefone: "(11) 99999-7777",
    dataCriacao: "2024-02-05"
  },
  {
    id: 10,
    nomeCliente: "Camila Souza",
    loja: "Casa & Decoração",
    cpf: "000.111.222-33",
    telefone: "(11) 98888-8888",
    dataCriacao: "2024-02-08"
  }
];

// Dados para os cards
const clientData = {
  totalClientes: mockClients.length,
  clientesAtivos: mockClients.length // Todos os clientes são considerados ativos neste exemplo
};

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState(mockClients);

  // Função para filtrar clientes com base no termo de pesquisa
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredClients(mockClients);
      return;
    }
    
    const filtered = mockClients.filter(client => 
      client.nomeCliente.toLowerCase().includes(term) ||
      client.loja.toLowerCase().includes(term) ||
      client.cpf.includes(term) ||
      client.telefone.includes(term)
    );
    
    setFilteredClients(filtered);
  };

  const handleVerDetalhes = (client: Client) => {
    console.log("Ver detalhes do cliente:", client.nomeCliente);
    // Implementar modal ou navegação para detalhes do cliente
  };

  const columns = [
    {
      key: 'nomeCliente' as keyof Client,
      label: 'Nome do Cliente',
      width: 'w-[220px]'
    },
    {
      key: 'loja' as keyof Client,
      label: 'Loja',
      width: 'w-[180px]'
    },
    {
      key: 'cpf' as keyof Client,
      label: 'CPF',
      width: 'w-[140px]'
    },
    {
      key: 'telefone' as keyof Client,
      label: 'Telefone',
      width: 'w-[140px]'
    },
    {
      key: 'dataCriacao' as keyof Client,
      label: 'Data de Cadastro',
      width: 'w-[140px]',
      render: (value: unknown) => {
        const dateValue = String(value);
        return new Date(dateValue).toLocaleDateString('pt-BR');
      }
    }
  ];

  const actions = [
    {
      icon: Eye,
      label: 'Ver Detalhes',
      onClick: handleVerDetalhes,
      color: 'primary'
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

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberCard
            title="Clientes"
            value={clientData.totalClientes}
            icon={Users}
            change={15}
            changeType="increase"
          />
          
          <NumberCard
            title="Ativos"
            value={clientData.clientesAtivos}
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
              placeholder="Pesquisar por nome, loja, CPF ou telefone..."
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
        actions={actions}
        itemsPerPage={10}
        emptyMessage="Nenhum cliente encontrado"
      />
    </div>
  );
}