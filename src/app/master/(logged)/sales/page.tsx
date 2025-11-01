'use client';

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Table from '@/app/components/tables/table';
import DatePicker from '@/app/components/selectors/datePicker';
import Selector from '@/app/components/selectors/selector';
import Search from '@/app/components/inputs/search';
import NumberCard from '@/app/components/cards/numberCard';
import ValueCard from '@/app/components/cards/valueCard';
import { CheckCircle, BarChart2, DollarSign, Store } from 'lucide-react';
import { getAccessToken } from '@/lib/utils/authUtils';
import { showToastWithAutoClose } from '@/lib/utils/toastUtils';
import RefundConfirmationModal from '@/app/components/modals/refundConfirmationModal';

// Interface para os dados de vendas do master
interface MasterSale {
  id: string;
  orderNumber?: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  status: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'transfer' | null;
  amount: number;
  // Dados da loja
  storeName: string;
  sellerName: string;
  sellerEmail: string;
  storeCommission: number;
  sellerAmount: number; // Valor que o seller recebeu
  storeId: string;
  isImported?: boolean; // Se o produto é importado
}
export default function Sales() {
  const [sales, setSales] = useState<MasterSale[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totals, setTotals] = useState({ totalVendas: 0, faturamentoTotal: 0, comissaoTotal: 0, ticketMedio: 0, refundsTotal: 0 });
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<MasterSale | null>(null);
  const [periodSel, setPeriodSel] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = getAccessToken();
        const params = new URLSearchParams();
        if (dateRange[0]) params.set('startDate', dateRange[0].toISOString());
        if (dateRange[1]) params.set('endDate', dateRange[1].toISOString());
        const res = await fetch(`/api/master/sales?${params.toString()}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        const json = await res.json();
        if (res.ok) {
          setSales(json.data || []);
          setTotals({
            totalVendas: json.totals?.totalVendas || 0,
            faturamentoTotal: json.totals?.faturamentoTotal || 0,
            comissaoTotal: json.totals?.comissaoTotal || 0,
            ticketMedio: json.totals?.ticketMedio || 0,
            refundsTotal: json.totals?.refundsTotal || 0,
          });
        } else {
          showToastWithAutoClose('error', json.error || 'Erro ao carregar vendas', 4000);
        }
      } catch (e) {
        console.error('Erro ao carregar vendas:', e);
        showToastWithAutoClose('error', 'Erro ao carregar vendas', 4000);
      }
    };
    fetchSales();
  }, [dateRange]);

  // Inicializa intervalo padrão ao montar
  useEffect(() => {
    if (!dateRange[0] || !dateRange[1]) {
      const now = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0,0,0,0);
      now.setHours(23,59,59,999);
      setDateRange([start, now]);
    }
  }, []);

  const totalVendas = totals.totalVendas;
  const faturamentoTotal = totals.faturamentoTotal;
  const comissaoTotal = totals.comissaoTotal;
  const ticketMedio = totals.ticketMedio;
  const refundsTotal = totals.refundsTotal;
  // Soma dos valores reembolsados no período (com base nas vendas carregadas)
  const refundedAmount = sales
    .filter((s) => s.status === 'REFUNDED')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  // Função para formatar data e hora
  const formatDateTime = (iso: string) => {
    const dateObj = new Date(iso);
    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para formatar status
  const formatStatus = (status: string) => {
    const map: Record<string, string> = { PAID: 'Pago', PENDING: 'Pendente', DELIVERED: 'Entregue', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado' };
    return map[status] || status;
  };

  // Função para formatar forma de pagamento
  const formatPaymentMethod = (method: MasterSale['paymentMethod']) => {
    if (!method) return '—';
    const methodMap: Record<string, string> = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      transfer: 'Transferência'
    };
    return methodMap[method] || method;
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
    setSelectedSale(sale);
    setIsRefundOpen(true);
  };

  const confirmRefund = async (password: string) => {
    if (!selectedSale) return;
    try {
      const token = getAccessToken();
      const res = await fetch(`/api/master/sales/${selectedSale.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ password })
      });
      const json = await res.json();
      if (!res.ok) {
        showToastWithAutoClose('error', json.error || 'Falha ao reembolsar', 4000);
        return;
      }
      showToastWithAutoClose('success', json.message || 'Reembolso realizado', 3000);
      // refresh list
      const params = new URLSearchParams();
      if (dateRange[0]) params.set('startDate', dateRange[0].toISOString());
      if (dateRange[1]) params.set('endDate', dateRange[1].toISOString());
      const token2 = getAccessToken();
      const res2 = await fetch(`/api/master/sales?${params.toString()}`, { headers: { Authorization: token2 ? `Bearer ${token2}` : '' } });
      const json2 = await res2.json();
      if (res2.ok) setSales(json2.data || []);
    } catch (e) {
      showToastWithAutoClose('error', 'Erro ao processar reembolso', 4000);
    } finally {
      setIsRefundOpen(false);
      setSelectedSale(null);
    }
  };

  const handleGoToStore = (sale: MasterSale) => {
    console.log('Ir para loja:', sale.storeName);
    // Implementar navegação para a loja
  };

  // Configuração das colunas
  const columns = [
    {
      key: 'orderNumber' as keyof MasterSale,
      label: 'Pedido',
      width: 'w-[160px]',
      render: (_value: unknown, item: MasterSale) => (item.orderNumber || item.id)
    },
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
      key: 'isImported' as keyof MasterSale,
      label: 'Tipo',
      width: 'w-[120px]',
      render: (value: unknown) => {
        const isImported = value as boolean;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              isImported ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-green-100 text-green-800 border-green-300'
            }`}
          >
            {isImported ? 'Importado' : 'Próprio'}
          </span>
        );
      }
    },
    {
      key: 'customerName' as keyof MasterSale,
      label: 'Cliente',
      width: 'w-[130px]'
    },
    {
      key: 'customerEmail' as keyof MasterSale,
      label: 'E-mail do cliente',
      width: 'w-[180px]'
    },
    {
      key: 'createdAt' as keyof MasterSale,
      label: 'Criado em',
      width: 'w-[170px]',
      render: (value: unknown) => formatDateTime(String(value))
    },
    {
      key: 'status' as keyof MasterSale,
      label: 'Status',
      width: 'w-[120px]',
      render: (value: unknown) => {
        const raw = String(value);
        const s = formatStatus(raw);
        const statusToClass: Record<string, string> = {
          PAID: 'bg-green-100 text-green-800',
          PENDING: 'bg-amber-100 text-amber-800',
          REFUNDED: 'bg-purple-100 text-purple-800',
          CANCELLED: 'bg-red-100 text-red-800',
          DEFAULT: 'bg-amber-100 text-amber-800'
        };
        const cls = statusToClass[raw] || statusToClass.DEFAULT;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {s}
          </span>
        );
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
      label: 'Total',
      width: 'w-[110px]',
      render: (value: unknown) => formatCurrency(value as number)
    },
    {
      key: 'storeCommission' as keyof MasterSale,
      label: 'Comissão da plataforma',
      width: 'w-[130px]',
      render: (value: unknown) => formatCurrency(value as number)
    },
    {
      key: 'sellerAmount' as keyof MasterSale,
      label: 'Comissão do seller',
      width: 'w-[110px]',
      render: (value: unknown) => (
        <span className="font-medium text-green-600">
          {formatCurrency(value as number)}
        </span>
      )
    }
  ];

  // Configuração das ações
  const actions = [
    {
      icon: RotateCcw,
      label: 'Processar reembolso',
      onClick: handleRefund,
      color: 'error',
      show: (s: MasterSale) => s.status === 'PAID'
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ValueCard
            title="Faturamento total"
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
            title="Vendas"
            value={totalVendas}
            icon={CheckCircle}
            change={8}
            changeType="increase"
          />

          <ValueCard
            title="Ticket médio"
            value={ticketMedio}
            currency="BRL"
            icon={BarChart2}
            change={5.2}
            changeType="increase"
            background="transparent"
          />
          <NumberCard
            title="Reembolsos"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(refundedAmount)}
            icon={RotateCcw}
            change={2.3}
            changeType="decrease"
          />
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <Selector
              value={periodSel}
              onChange={(val) => {
                const v = (val as 'today' | 'week' | 'month' | 'year' | 'all');
                setPeriodSel(v);
                const end = new Date();
                const start = new Date();
                if (v === 'today') {
                  start.setHours(0,0,0,0);
                  end.setHours(23,59,59,999);
                } else if (v === 'week') {
                  start.setDate(start.getDate() - 7);
                  start.setHours(0,0,0,0);
                  end.setHours(23,59,59,999);
                } else if (v === 'month') {
                  start.setMonth(start.getMonth() - 1);
                  start.setHours(0,0,0,0);
                  end.setHours(23,59,59,999);
                } else if (v === 'year') {
                  start.setFullYear(start.getFullYear() - 1);
                  start.setHours(0,0,0,0);
                  end.setHours(23,59,59,999);
                } else if (v === 'all') {
                  start.setTime(new Date('1900-01-01T00:00:00').getTime());
                  end.setHours(23,59,59,999);
                }
                setDateRange([start, end]);
              }}
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
              placeholder="Buscar por loja, produto, cliente ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de vendas */}
      <Table
        data={sales.filter(sale => {
          const q = searchTerm.toLowerCase();
          if (!q) return true;
          return (
            sale.storeName.toLowerCase().includes(q) ||
            sale.sellerName.toLowerCase().includes(q) ||
            sale.productName.toLowerCase().includes(q) ||
            sale.customerName.toLowerCase().includes(q) ||
            sale.customerEmail.toLowerCase().includes(q)
          );
        })}
        columns={columns}
        actions={actions}
        itemsPerPage={10}
        emptyMessage="Nenhuma venda concluída encontrada"
      />

      <RefundConfirmationModal
        isOpen={isRefundOpen}
        onClose={() => { setIsRefundOpen(false); setSelectedSale(null); }}
        onConfirm={confirmRefund}
        orderNumber={selectedSale?.orderNumber || selectedSale?.id || ''}
        amount={selectedSale ? selectedSale.amount : 0}
      />
    </div>
  );
}   