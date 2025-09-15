'use client';

import { useState } from 'react';
import NumberCard from "@/app/components/cards/numberCard";
import Table from "@/app/components/tables/table";
import Search from "@/app/components/inputs/search";
import { Store, ShieldX, Shield, UserCheck, ExternalLink } from "lucide-react";

// Interface para os dados dos sellers
interface Seller {
  id: number;
  nomeLoja: string;
  nomeSeller: string;
  cpf: string;
  email: string;
  telefone: string;
  faturamentoBruto: number;
  comissao: number;
  quantidadeVendas: number;
  dataCriacao: string;
  status: string;
}

// Dados mock para as lojas
const mockSellers: Seller[] = [
  {
    id: 1,
    nomeLoja: "Tech Store SP",
    nomeSeller: "João Silva Santos",
    cpf: "123.456.789-00",
    email: "joao@techstore.com",
    telefone: "(11) 99999-1234",
    faturamentoBruto: 45000.00,
    comissao: 45000.00 * 0.05, // 5% do faturamento bruto
    quantidadeVendas: 127,
    dataCriacao: "2024-01-15",
    status: "ativo"
  },
  {
    id: 2,
    nomeLoja: "Fashion Boutique",
    nomeSeller: "Maria Oliveira Costa",
    cpf: "987.654.321-00",
    email: "maria@fashionboutique.com",
    telefone: "(11) 88888-5678",
    faturamentoBruto: 32000.00,
    comissao: 32000.00 * 0.05, // 5% do faturamento bruto
    quantidadeVendas: 89,
    dataCriacao: "2024-02-10",
    status: "ativo"
  },
  {
    id: 3,
    nomeLoja: "Casa & Decoração",
    nomeSeller: "Carlos Eduardo Lima",
    cpf: "456.789.123-00",
    email: "carlos@casadecoracao.com",
    telefone: "(11) 77777-9012",
    faturamentoBruto: 28500.00,
    comissao: 28500.00 * 0.05, // 5% do faturamento bruto
    quantidadeVendas: 72,
    dataCriacao: "2024-01-28",
    status: "bloqueado"
  },
  {
    id: 4,
    nomeLoja: "Sports Center",
    nomeSeller: "Ana Paula Rodrigues",
    cpf: "789.123.456-00",
    email: "ana@sportscenter.com",
    telefone: "(11) 66666-3456",
    faturamentoBruto: 52000.00,
    comissao: 52000.00 * 0.05, // 5% do faturamento bruto
    quantidadeVendas: 145,
    dataCriacao: "2023-12-05",
    status: "ativo"
  },
  {
    id: 5,
    nomeLoja: "Eletrônicos Plus",
    nomeSeller: "Roberto Santos Filho",
    cpf: "321.654.987-00",
    email: "roberto@eletronicosplus.com",
    telefone: "(11) 55555-7890",
    faturamentoBruto: 67000.00,
    comissao: 67000.00 * 0.05, // 5% do faturamento bruto
    quantidadeVendas: 198,
    dataCriacao: "2023-11-20",
    status: "ativo"
  }
];

// Dados para os cards
const masterData = {
  lojasCadastradas: mockSellers.length,
  lojasBloqueadas: mockSellers.filter(seller => seller.status === "bloqueado").length
};

export default function Sellers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSellers, setFilteredSellers] = useState(mockSellers);

  // Função para filtrar sellers com base no termo de pesquisa
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredSellers(mockSellers);
      return;
    }
    
    const filtered = mockSellers.filter(seller => 
      seller.nomeLoja.toLowerCase().includes(term) ||
      seller.nomeSeller.toLowerCase().includes(term) ||
      seller.email.toLowerCase().includes(term) ||
      seller.cpf.includes(term) ||
      seller.telefone.includes(term)
    );
    
    setFilteredSellers(filtered);
  };

  const handleBloquearLoja = (seller: Seller) => {
    console.log("Bloquear loja:", seller.nomeLoja);
    // Implementar lógica para bloquear/desbloquear loja
  };

  const handleEntrarAdmin = (seller: Seller) => {
    console.log("Entrar no admin da loja:", seller.nomeLoja);
    // Implementar navegação para admin da loja
  };

  const handleIrParaLoja = (seller: Seller) => {
    console.log("Ir para loja:", seller.nomeLoja);
    // Implementar navegação para a loja
  };

  const columns = [
    {
      key: 'nomeLoja' as keyof Seller,
      label: 'Nome da Loja',
      width: 'w-[180px]'
    },
    {
      key: 'nomeSeller' as keyof Seller,
      label: 'Nome do Seller',
      width: 'w-[200px]'
    },
    {
      key: 'cpf' as keyof Seller,
      label: 'CPF',
      width: 'w-[140px]'
    },
    {
      key: 'email' as keyof Seller,
      label: 'Email',
      width: 'w-[220px]'
    },
    {
      key: 'telefone' as keyof Seller,
      label: 'Telefone',
      width: 'w-[140px]'
    },
    {
      key: 'quantidadeVendas' as keyof Seller,
      label: 'Qtd. Vendas',
      width: 'w-[120px]',
      render: (value: unknown) => {
        const numValue = Number(value);
        return numValue.toLocaleString('pt-BR');
      }
    },
    {
      key: 'faturamentoBruto' as keyof Seller,
      label: 'Faturamento Bruto',
      width: 'w-[160px]',
      render: (value: unknown) => {
        const numValue = Number(value);
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numValue);
      }
    },
    {
      key: 'comissao' as keyof Seller,
      label: 'Comissão (5%)',
      width: 'w-[140px]',
      render: (value: unknown) => {
        const numValue = Number(value);
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numValue);
      }
    },
    {
      key: 'dataCriacao' as keyof Seller,
      label: 'Data de Criação',
      width: 'w-[140px]',
      render: (value: unknown) => {
        const dateValue = String(value);
        return new Date(dateValue).toLocaleDateString('pt-BR');
      }
    }
  ];

  const actions = [
    {
      icon: Shield,
      label: 'Bloquear/Desbloquear Loja',
      onClick: handleBloquearLoja,
      color: 'error',
      show: (seller: Seller) => seller.status === 'ativo'
    },
    {
      icon: ShieldX,
      label: 'Desbloquear Loja',
      onClick: handleBloquearLoja,
      color: 'secondary',
      show: (seller: Seller) => seller.status === 'bloqueado'
    },
    {
      icon: UserCheck,
      label: 'Entrar no Admin',
      onClick: handleEntrarAdmin,
      color: 'primary'
    },
    {
      icon: ExternalLink,
      label: 'Ir para Loja',
      onClick: handleIrParaLoja,
      color: 'primary'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Sellers
          </h1>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NumberCard
            title="Lojas Cadastradas"
            value={masterData.lojasCadastradas}
            icon={Store}
            change={12}
            changeType="increase"
          />
          
          <NumberCard
            title="Lojas Bloqueadas"
            value={masterData.lojasBloqueadas}
            icon={ShieldX}
            change={-8}
            changeType="decrease"
            background="transparent"
          />
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-[400px]">
            <Search
              placeholder="Pesquisar por loja, seller, email, CPF ou telefone..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Tabela de sellers */}
      <Table
        data={filteredSellers}
        columns={columns}
        actions={actions}
        itemsPerPage={10}
        emptyMessage="Nenhuma loja encontrada"
      />
    </div>
  );
}