'use client';

import { useEffect, useState } from 'react';
import { Store } from '@/lib/types';
import StoreNavbar from '../patterns/storeNavbar';
import Footer from '../patterns/footer';
import Table from '@/app/components/tables/table';
import Search from '@/app/components/inputs/search';
import { Download, Eye, Copy, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
import { useCache } from '@/lib/hooks/useCache';
import NumberCard from '@/app/components/cards/numberCard';
import Badge from '@/app/components/ui/badge';
import ContentModal from '@/app/components/modals/contentModal';

interface Transaction {
  id: string;
  orderId: string;
  paymentId: string;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  orderId: string;
  productId: string;
  productName: string;
  productDescription?: string;
  productPrice: number;
  quantity: number;
  orderStatus: string;
  paymentStatus: string;
  deliveredContent: string;
  downloadUrl?: string;
  deliverables?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  expiresAt?: string;
  isDownloaded: boolean;
  downloadCount: number;
  storeName: string;
  storeSubdomain: string;
  storePrimaryColor?: string;
  storeSecondaryColor?: string;
  createdAt: string;
  updatedAt: string;
  transactions: Transaction[];
  latestTransaction?: Transaction;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
}

export default function OrdersPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  // Cache para dados da loja
  const { data: storeData, loading: storeLoading } = useCache(
    async () => {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      const response = await fetch(`/api/storefront/store?subdomain=${subdomain}`);
      
      if (!response.ok) {
        throw new Error('Loja não encontrada');
      }

      return await response.json();
    },
    {
      key: 'store_data',
      duration: 10 * 60 * 1000, // 10 minutos
      userId: (() => {
        try {
          if (typeof window === 'undefined') return null;
          const token = localStorage.getItem('customer_access_token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub || null;
          }
        } catch (error) {
          console.error('Erro ao obter userId do token:', error);
        }
        return null;
      })(),
    }
  );

  // Cache para pedidos e purchases
  const { data: ordersData, loading: ordersLoading, error: ordersError, refresh: refreshOrders } = useCache(
    async () => {
      const accessToken = localStorage.getItem('customer_access_token');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/customer/orders/list', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      return await response.json();
    },
    {
      key: 'customer_orders_list',
      duration: 2 * 60 * 1000, // Reduzido para 2 minutos
      userId: (() => {
        try {
          if (typeof window === 'undefined') return null;
          const token = localStorage.getItem('customer_access_token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId || payload.sub || null;
          }
        } catch (error) {
          console.error('Erro ao obter userId do token:', error);
        }
        return null;
      })(),
    }
  );

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Invalidação automática do cache quando a página ganha foco
  useEffect(() => {
    const handleFocus = () => {
      // Refresh automático quando a página ganha foco (usuário volta da aba)
      refreshOrders();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh quando a página fica visível novamente
        refreshOrders();
      }
    };

    // Listener para detectar mudanças no localStorage (novas compras)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customer_access_token' || e.key?.includes('order')) {
        // Invalidar cache quando há mudanças relacionadas a pedidos
        refreshOrders();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshOrders]);

  useEffect(() => {
    if (storeData) {
      setStore(storeData.store);
    }
  }, [storeData]);

  useEffect(() => {
    if (ordersError) {
      showErrorToast('Erro ao carregar pedidos');
    }
  }, [ordersError]);

  function checkAuthentication() {
    const accessToken = localStorage.getItem('customer_access_token');
    const userData = localStorage.getItem('customer_user_data');
    
    if (accessToken && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUserName(user.name);
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        setIsAuthenticated(false);
        setUserName(undefined);
      }
    } else {
      setIsAuthenticated(false);
      setUserName(undefined);
    }
  }

  const handleDownload = async (purchaseId: string, downloadUrl: string) => {
    try {
      // Implementar lógica de download
      window.open(downloadUrl, '_blank');
      showSuccessToast('Download iniciado!');
    } catch (error) {
      console.error('Erro no download:', error);
      showErrorToast('Erro ao fazer download');
    }
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showSuccessToast('Conteúdo copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      showErrorToast('Erro ao copiar conteúdo');
    }
  };

  const handleViewContent = (item: OrderItem) => {
    setSelectedOrder(item);
    setIsContentModalOpen(true);
  };

  // Preparar dados para a tabela usando purchases
  const purchases = ordersData?.purchases || [];
  const stats = ordersData?.stats || {
    totalOrders: 0,
    totalPurchases: 0,
    deliveredPurchases: 0,
    pendingPurchases: 0,
    totalDownloads: 0,
    totalAmount: 0
  };

  const tableData = purchases.map((purchase: {
    id: string;
    orderNumber: string;
    productName: string;
    productDescription: string;
    deliveredContent: string | null;
    downloadUrl: string | null;
    deliverables: { name: string; url: string }[];
    isDownloaded: boolean;
    downloadCount: number;
    createdAt: string;
    orderStatus: string;
    paymentStatus: string | null;
    totalAmount: number;
    quantity: number;
    productPrice: number;
    storeName: string;
    customerEmail: string;
    customerName: string | null;
    customerPhone: string | null;
    paymentMethod: string | null;
    latestTransaction: { id: string; status: string; amount: number } | null;
  }) => ({
    id: purchase.id,
    orderNumber: purchase.orderNumber,
    productName: purchase.productName,
    productDescription: purchase.productDescription,
    deliveredContent: purchase.deliveredContent,
    downloadUrl: purchase.downloadUrl,
    deliverables: purchase.deliverables || [],
    isDownloaded: purchase.isDownloaded,
    downloadCount: purchase.downloadCount,
    createdAt: purchase.createdAt,
    orderStatus: purchase.orderStatus,
    paymentStatus: purchase.paymentStatus,
    totalAmount: purchase.totalAmount,
    quantity: purchase.quantity,
    productPrice: purchase.productPrice,
    storeName: purchase.storeName,
    customerEmail: purchase.customerEmail,
    customerName: purchase.customerName,
    customerPhone: purchase.customerPhone,
    paymentMethod: purchase.paymentMethod,
    latestTransaction: purchase.latestTransaction
  }));

  // Filtrar dados baseado na busca
  const filteredData = tableData.filter((item: typeof tableData[0]) => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.orderStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.paymentStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.productDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'orderNumber' as keyof OrderItem,
      label: 'Pedido',
      width: 'w-40',
      render: (value: unknown) => `#${value}`,
    },
    {
      key: 'productName' as keyof OrderItem,
      label: 'Produto',
      width: 'w-48',
    },
    {
      key: 'deliveredContent' as keyof OrderItem,
      label: 'Conteúdo',
      width: 'w-32',
      render: (value: unknown) => {
        return value ? 'Entregue' : 'Pendente';
      },
    },
    {
      key: 'orderStatus' as keyof OrderItem,
      label: 'Status',
      width: 'w-28',
      render: (value: unknown) => {
        const statusMap: Record<string, string> = {
          PENDING: 'Pendente',
          PAID: 'Pago',
          DELIVERED: 'Entregue',
          CANCELLED: 'Cancelado',
          REFUNDED: 'Reembolsado',
        };
        const statusText = statusMap[value as string] || (value as string);
        return (
          <Badge 
            status={statusText} 
            primaryColor={store?.primaryColor} 
            secondaryColor={store?.secondaryColor} 
          />
        );
      },
    },
    {
      key: 'paymentMethod' as keyof OrderItem,
      label: 'Pagamento',
      width: 'w-28',
      render: (value: unknown) => {
        const methodMap: Record<string, string> = {
          PIX: 'PIX',
          CREDIT_CARD: 'Cartão de Crédito',
          DEBIT_CARD: 'Cartão de Débito',
          BOLETO: 'Boleto',
          TRANSFER: 'Transferência',
        };
        const method = methodMap[value as string] || 'PIX';
        return (
          <Badge 
            status={method} 
            primaryColor={store?.primaryColor} 
            secondaryColor={store?.secondaryColor} 
          />
        );
      },
    },
    {
      key: 'totalAmount' as keyof OrderItem,
      label: 'Valor',
      width: 'w-24',
      render: (value: unknown) => `R$ ${(value as number).toFixed(2)}`,
    },
    {
      key: 'createdAt' as keyof OrderItem,
      label: 'Data',
      width: 'w-28',
      render: (value: unknown) => new Date(value as string).toLocaleDateString('pt-BR'),
    },
  ];

  const actions = [
    {
      icon: Eye,
      label: 'Ver Conteúdo',
      onClick: (item: OrderItem) => {
        if (item.deliveredContent) {
          handleViewContent(item);
        } else {
          showErrorToast('Conteúdo ainda não foi entregue');
        }
      },
      show: (item: OrderItem) => !!item.deliveredContent,
    },
    {
      icon: Copy,
      label: 'Copiar Conteúdo',
      onClick: (item: OrderItem) => {
        if (item.deliveredContent) {
          handleCopyContent(item.deliveredContent);
        } else {
          showErrorToast('Conteúdo ainda não foi entregue');
        }
      },
      show: (item: OrderItem) => !!item.deliveredContent,
    },
    {
      icon: Download,
      label: 'Download',
      onClick: (item: OrderItem) => {
        if (item.downloadUrl) {
          handleDownload(item.id, item.downloadUrl);
        } else if (item.deliverables && item.deliverables.length > 0) {
          // Se não tem downloadUrl mas tem deliverables, usar o primeiro
          handleDownload(item.id, item.deliverables[0].url);
        } else {
          showErrorToast('Download não disponível');
        }
      },
      show: (item: OrderItem) => !!(item.downloadUrl || (item.deliverables && item.deliverables.length > 0)),
    },
  ];

  if (storeLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
          <p className="text-gray-600">O domínio solicitado não está configurado.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StoreNavbar
          store={store}
          isAuthenticated={false}
          onLoginClick={() => window.location.href = '/shop/auth/login'}
          onRegisterClick={() => window.location.href = '/shop/auth/register'}
        />
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso negado</h1>
            <p className="text-gray-600 mb-6">Você precisa estar logado para ver seus pedidos.</p>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = '/shop/auth/login'}
                className="px-8 py-3 text-md rounded-full transition-all flex items-center gap-2 cursor-pointer hover:opacity-90 font-medium"
                style={{ 
                  backgroundColor: store.primaryColor || '#bd253c',
                  color: 'white',
                  border: `2px solid ${store.primaryColor || '#bd253c'}`
                }}
              >
                Fazer login
              </button>
            </div>
          </div>
        </div>

        <Footer store={store} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <StoreNavbar
        store={store}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLoginClick={() => window.location.href = '/shop/auth/login'}
        onRegisterClick={() => window.location.href = '/shop/auth/register'}
      />

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-8 py-12">
        {/* Header com Botão de Voltar */}
        <div className="flex items-center justify-between mb-8">
          <h1 
            className="text-3xl font-bold"
            style={{ color: store.primaryColor || '#bd253c' }}
          >
            Pedidos
          </h1>
          
          <button
            onClick={() => window.location.href = '/shop'}
            className="px-8 py-3 text-md rounded-full transition-all flex items-center gap-2 cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: store.secondaryColor || '#970b27',
              color: 'white',
              border: `2px solid ${store.secondaryColor || '#970b27'}`
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <NumberCard
            title="Total de pedidos"
            value={ordersLoading ? '...' : stats.totalOrders}
            icon={CheckCircle}
            background="transparent"
            className={`shadow-sm border border-gray-100 ${ordersLoading ? 'opacity-75' : ''}`}
            style={{
              '--primary': store.primaryColor || '#bd253c',
              '--secondary': store.secondaryColor || '#970b27',
              '--background': '#ffffff',
              '--foreground': '#111827',
              '--on-background': '#6b7280',
              '--on-primary': '#ffffff'
            } as React.CSSProperties}
          />

          <NumberCard
            title="Produtos entregues"
            value={ordersLoading ? '...' : stats.deliveredPurchases}
            icon={Download}
            background="transparent"
            className={`shadow-sm border border-gray-100 ${ordersLoading ? 'opacity-75' : ''}`}
            style={{
              '--primary': store.secondaryColor || '#970b27',
              '--secondary': store.primaryColor || '#bd253c',
              '--background': '#ffffff',
              '--foreground': '#111827',
              '--on-background': '#6b7280',
              '--on-primary': '#ffffff'
            } as React.CSSProperties}
          />

          <NumberCard
            title="Downloads realizados"
            value={ordersLoading ? '...' : stats.totalDownloads}
            icon={Eye}
            background="transparent"
            className={`shadow-sm border border-gray-100 ${ordersLoading ? 'opacity-75' : ''}`}
            style={{
              '--primary': store.primaryColor || '#bd253c',
              '--secondary': store.secondaryColor || '#970b27',
              '--background': '#ffffff',
              '--foreground': '#111827',
              '--on-background': '#6b7280',
              '--on-primary': '#ffffff'
            } as React.CSSProperties}
          />
        </div>

        {/* Tabela de Pedidos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Produtos comprados</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Clique nas ações para acessar seu conteúdo
                  </p>
                </div>
                
                {/* Botão de Refresh */}
                <button
                  onClick={refreshOrders}
                  disabled={ordersLoading}
                  className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Atualizar lista de pedidos"
                >
                  <RefreshCw 
                    size={18} 
                    className={`text-gray-600 ${ordersLoading ? 'animate-spin' : ''}`} 
                  />
                </button>
              </div>
              
              {/* Componente de Busca */}
              <div className="w-full sm:w-80">
                <Search
                  placeholder="Buscar por produto, pedido ou status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  primaryColor={store.primaryColor}
                  secondaryColor={store.secondaryColor}
                />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <Table
              data={filteredData}
              columns={columns}
              actions={actions}
              itemsPerPage={10}
              emptyMessage="Nenhum pedido encontrado. Faça sua primeira compra!"
              primaryColor={store.primaryColor}
              secondaryColor={store.secondaryColor}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer store={store} />

      {/* Modal de Conteúdo */}
      {selectedOrder && (
        <ContentModal
          isOpen={isContentModalOpen}
          onClose={() => {
            setIsContentModalOpen(false);
            setSelectedOrder(null);
          }}
          orderData={selectedOrder}
          primaryColor={store?.primaryColor}
          secondaryColor={store?.secondaryColor}
        />
      )}
    </div>
  );
}