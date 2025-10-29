'use client';

import { useState, useEffect } from 'react';
import NumberCard from "@/app/components/cards/numberCard";
import Table from "@/app/components/tables/table";
import Search from "@/app/components/inputs/search";
import { Store, ShieldX, Shield, UserCheck, ExternalLink } from "lucide-react";
import { getAccessToken } from '@/lib/utils/authUtils';
import { showToastWithAutoClose } from '@/lib/utils/toastUtils';
import BanSellerModal from '@/app/components/modals/banSellerModal';

// Interface para os dados dos sellers
interface Seller {
  id: string;
  nomeLoja: string;
  nomeSeller: string;
  cpf: string;
  email: string;
  telefone: string;
  faturamentoBruto: number;
  comissao: number;
  quantidadeVendas: number;
  dataCriacao: string;
  status: 'ativo' | 'bloqueado';
  subdomain: string | null;
}

export default function Sellers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [masterData, setMasterData] = useState({
    lojasCadastradas: 0,
    lojasBloqueadas: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  // Buscar sellers da API
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setIsLoading(true);
        const token = getAccessToken();
        const res = await fetch('/api/master/sellers', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        const json = await res.json();
        if (res.ok && json?.data) {
          setSellers(json.data);
          setFilteredSellers(json.data);
          setMasterData({
            lojasCadastradas: json.totals?.lojasCadastradas || 0,
            lojasBloqueadas: json.totals?.lojasBloqueadas || 0
          });
        } else {
          showToastWithAutoClose('error', json.error || 'Erro ao carregar sellers', 4000);
        }
      } catch (e) {
        console.error('Erro ao buscar sellers:', e);
        showToastWithAutoClose('error', 'Erro ao carregar sellers', 4000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, []);

  // Função para filtrar sellers com base no termo de pesquisa
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredSellers(sellers);
      return;
    }
    
    const filtered = sellers.filter(seller => 
      seller.nomeLoja.toLowerCase().includes(term) ||
      seller.nomeSeller.toLowerCase().includes(term) ||
      seller.email.toLowerCase().includes(term) ||
      seller.cpf.replace(/[.-]/g, '').includes(term.replace(/[.-]/g, '')) ||
      seller.telefone.replace(/[()-\s]/g, '').includes(term.replace(/[()-\s]/g, ''))
    );
    
    setFilteredSellers(filtered);
  };

  const handleBloquearLoja = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedSeller) return;

    try {
      // Tentar renovar o token antes de fazer a requisição
      const { refreshAuthToken } = await import('@/lib/utils/authUtils');
      await refreshAuthToken('master');
      
      const token = getAccessToken();
      const action = selectedSeller.status === 'ativo' ? 'block' : 'unblock';
      
      if (!token) {
        showToastWithAutoClose('error', 'Token de acesso não encontrado. Faça login novamente.', 4000);
        return;
      }
      
      const res = await fetch(`/api/master/sellers/${selectedSeller.id}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      const json = await res.json();

      if (res.ok) {
        showToastWithAutoClose('success', json.message || 'Operação realizada com sucesso', 4000);
        // Recarregar sellers
        const refreshToken = getAccessToken();
        const refreshRes = await fetch('/api/master/sellers', {
          headers: {
            'Authorization': refreshToken ? `Bearer ${refreshToken}` : ''
          }
        });
        const refreshJson = await refreshRes.json();
        if (refreshRes.ok && refreshJson?.data) {
          setSellers(refreshJson.data);
          setFilteredSellers(refreshJson.data);
          setMasterData({
            lojasCadastradas: refreshJson.totals?.lojasCadastradas || 0,
            lojasBloqueadas: refreshJson.totals?.lojasBloqueadas || 0
          });
        }
      } else {
        showToastWithAutoClose('error', json.error || 'Erro ao realizar operação', 4000);
      }
    } catch (error) {
      console.error('Erro ao bloquear/desbloquear loja:', error);
      showToastWithAutoClose('error', 'Erro ao realizar operação', 4000);
    }
  };

  const handleEntrarAdmin = (seller: Seller) => {
    // Redirecionar para o dashboard do seller (implementar se necessário)
    console.log("Entrar no admin da loja:", seller);
    showToastWithAutoClose('info', 'Funcionalidade será implementada em breve', 4000);
  };

  const handleIrParaLoja = (seller: Seller) => {
    if (seller.subdomain) {
      // Abrir loja em nova aba
      window.open(`https://${seller.subdomain}.ckeet.store`, '_blank');
    } else {
      showToastWithAutoClose('error', 'Loja não possui subdomain configurado', 4000);
    }
  };

  const columns = [
    {
      key: 'nomeLoja' as keyof Seller,
      label: 'Loja',
      width: 'w-[180px]'
    },
    {
      key: 'nomeSeller' as keyof Seller,
      label: 'Seller',
      width: 'w-[200px]'
    },
    {
      key: 'cpf' as keyof Seller,
      label: 'CPF',
      width: 'w-[140px]'
    },
    {
      key: 'email' as keyof Seller,
      label: 'E-mail',
      width: 'w-[220px]'
    },
    {
      key: 'telefone' as keyof Seller,
      label: 'Telefone',
      width: 'w-[140px]'
    },
    {
      key: 'status' as keyof Seller,
      label: 'Status',
      width: 'w-[120px]',
      render: (value: unknown) => {
        const v = String(value);
        const isActive = v === 'ativo';
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block ${
              isActive
                ? 'text-green-700 border-green-300 bg-green-50'
                : 'text-red-700 border-red-300 bg-red-50'
            }`}
          >
            {isActive ? 'Ativa' : 'Bloqueada'}
          </span>
        );
      }
    },
    {
      key: 'quantidadeVendas' as keyof Seller,
      label: 'Qtd. vendas',
      width: 'w-[120px]',
      render: (value: unknown) => {
        const numValue = Number(value);
        return numValue.toLocaleString('pt-BR');
      }
    },
    {
      key: 'faturamentoBruto' as keyof Seller,
      label: 'Bruto',
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
      label: 'Comissão',
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
      label: 'Criado em',
      width: 'w-[140px]',
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

  const actions = [
    {
      icon: Shield,
      label: 'Bloquear loja',
      onClick: handleBloquearLoja,
      color: 'error',
      show: (seller: Seller) => seller.status === 'ativo' && seller.subdomain !== null
    },
    {
      icon: ShieldX,
      label: 'Desbloquear loja',
      onClick: handleBloquearLoja,
      color: 'secondary',
      show: (seller: Seller) => seller.status === 'bloqueado' && seller.subdomain !== null
    },
    {
      icon: UserCheck,
      label: 'Entrar no admin',
      onClick: handleEntrarAdmin,
      color: 'primary',
      show: (seller: Seller) => seller.subdomain !== null
    },
    {
      icon: ExternalLink,
      label: 'Ir para loja',
      onClick: handleIrParaLoja,
      color: 'primary',
      show: (seller: Seller) => seller.subdomain !== null
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
            title="Lojas cadastradas"
            value={masterData.lojasCadastradas}
            icon={Store}
            change={0}
            changeType="increase"
          />
          
          <NumberCard
            title="Lojas bloqueadas"
            value={masterData.lojasBloqueadas}
            icon={ShieldX}
            change={0}
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : (
        <Table
          data={filteredSellers}
          columns={columns}
          actions={actions}
          itemsPerPage={10}
          emptyMessage="Nenhuma loja encontrada"
        />
      )}

      {/* Modal de confirmação */}
      {selectedSeller && (
        <BanSellerModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSeller(null);
          }}
          onConfirm={handleConfirmBlock}
          lojaName={selectedSeller.nomeLoja}
          action={selectedSeller.status === 'ativo' ? 'ban' : 'unban'}
        />
      )}
    </div>
  );
}