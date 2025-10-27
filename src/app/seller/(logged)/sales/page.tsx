'use client';

import { useState, useEffect } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import Table from '@/app/components/tables/table';
import Selector from '@/app/components/selectors/selector';
import Search from '@/app/components/inputs/search';
import NumberCard from '@/app/components/cards/numberCard';
import { Clock, CheckCircle, BarChart2 } from 'lucide-react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import toast from 'react-hot-toast';
import Badge from '@/app/components/ui/badge';
import OrderDetailsModal from '@/app/components/modals/orderDetailsModal';

type PeriodOption = 'today' | 'week' | 'month' | 'year' | 'all';

// Interface para os dados de vendas
interface Sale {
  id: string;
  orderNumber: string;
  orderId: string;
  productName: string;
  productId: string;
  productDescription?: string;
  customerName: string;
  customerEmail: string;
  paymentDate: string;
  status: string;
  paymentMethod: string;
  amount: number;
  createdAt: string;
  deliveredContent?: string;
  downloadUrl?: string;
  deliverables?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

function SalesContent() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [period, setPeriod] = useState<PeriodOption>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const fetchSales = async () => {
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

      const response = await fetch(`/api/seller/dashboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar vendas');
      }

      // Buscar ordens com detalhes dos produtos e clientes
      const ordersResponse = await fetch(`/api/seller/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        
        // Transformar orders em sales
        const salesData: Sale[] = ordersData.data?.map((order: {
          id: string;
          orderNumber: string;
          products: Array<{ 
            product: { name: string; imageUrl: string; description?: string };
            productId: string;
          }>;
          customer: { name: string; email: string } | null;
          status: string;
          paymentMethod: string | null;
          totalAmount: number;
          createdAt: string;
          purchases: Array<{
            deliveredContent?: string;
            downloadUrl?: string;
          }>;
        }) => {
          const firstProduct = order.products?.[0];
          const firstPurchase = order.purchases?.[0];
          
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            orderId: order.id,
            productName: firstProduct?.product?.name || 'Produto não encontrado',
            productId: firstProduct?.productId || '',
            productDescription: firstProduct?.product?.description,
            customerName: order.customer?.name || 'Cliente não encontrado',
            customerEmail: order.customer?.email || 'Email não encontrado',
            paymentDate: order.createdAt,
            status: order.status,
            paymentMethod: order.paymentMethod || 'N/A',
            amount: order.totalAmount,
            createdAt: order.createdAt,
            deliveredContent: firstPurchase?.deliveredContent,
            downloadUrl: firstPurchase?.downloadUrl
          };
        }) || [];

        setSales(salesData);
      } else {
        setSales([]);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Filtrar vendas por termo de busca
  const filteredSales = sales.filter(sale => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.productName.toLowerCase().includes(searchLower) ||
      sale.customerName.toLowerCase().includes(searchLower) ||
      sale.customerEmail.toLowerCase().includes(searchLower) ||
      sale.orderNumber.toLowerCase().includes(searchLower)
    );
  });

  // Calcular estatísticas
  const totalOrdens = sales.length;
  const ordensAprovadas = sales.filter(sale => sale.status === 'PAID').length;
  const ordensPendentes = sales.filter(sale => sale.status === 'PENDING').length;
  const taxaConversao = totalOrdens > 0 ? (ordensAprovadas / totalOrdens) * 100 : 0;

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
      'PENDING': 'Pendente',
      'PAID': 'Pago',
      'CANCELLED': 'Cancelado',
      'REFUNDED': 'Reembolsado',
      'COMPLETED': 'Completo',
      'FAILED': 'Falhou'
    };
    return statusMap[status] || status;
  };

  // Função para formatar forma de pagamento
  const formatPaymentMethod = (method: string) => {
    const methodMap: Record<string, string> = {
      'CREDIT_CARD': 'Cartão de Crédito',
      'DEBIT_CARD': 'Cartão de Débito',
      'PIX': 'PIX',
      'BOLETO': 'Boleto',
      'TRANSFER': 'Transferência'
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
  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleRefund = (_sale: Sale) => {
    // Implementar lógica de reembolso
  };

  // Configuração das colunas
  const columns = [
    {
      key: 'orderNumber' as keyof Sale,
      label: 'Nº Pedido',
      width: 'w-[150px]'
    },
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
      label: 'E-mail',
      width: 'w-[200px]'
    },
    {
      key: 'paymentDate' as keyof Sale,
      label: 'Data',
      width: 'w-[140px]',
      render: (value: unknown) => formatDateTime(value as string)
    },
    {
      key: 'status' as keyof Sale,
      label: 'Status',
      width: 'w-[120px]',
      render: (value: unknown) => <Badge status={formatStatus(value as string)} />
    },
    {
      key: 'paymentMethod' as keyof Sale,
      label: 'Pagamento',
      width: 'w-[160px]',
      render: (value: unknown) => formatPaymentMethod(value as string)
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
      show: (sale: Sale) => sale.status === 'PAID'
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
            Vendas
          </h1>
        </div>

        {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberCard
           title="Pendentes"
           value={ordensPendentes}
           icon={Clock}
            change={0}
            changeType="increase"
         />
         
         <NumberCard
           title="Aprovadas"
           value={ordensAprovadas}
           icon={CheckCircle}
            change={0}
           changeType="increase"
         />

         <NumberCard
           title="Taxa de conversão"
           value={`${taxaConversao.toFixed(1)}%`}
           icon={BarChart2}
            change={0}
           changeType="increase"
           background="colored"
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
              placeholder="Buscar por produto, cliente ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de vendas */}
      <div className="flex-1 min-h-0 md:min-h-[500px]">
        <Table
          data={filteredSales}
          columns={columns}
          actions={actions}
          itemsPerPage={10}
          emptyMessage="Nenhuma venda encontrada"
        />
      </div>

      {/* Modal de detalhes */}
      {selectedSale && isModalOpen && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSale(null);
          }}
          orderData={{
            orderId: selectedSale.orderId,
            orderNumber: selectedSale.orderNumber,
            productName: selectedSale.productName,
            productDescription: selectedSale.productDescription,
            customerName: selectedSale.customerName,
            customerEmail: selectedSale.customerEmail,
            status: selectedSale.status,
            paymentMethod: selectedSale.paymentMethod,
            amount: selectedSale.amount,
            createdAt: selectedSale.createdAt
          }}
        />
      )}
    </div>
  );
}

export default function Sales() {
  return (
    <AuthGuard>
      <SalesContent />
    </AuthGuard>
  );
}
