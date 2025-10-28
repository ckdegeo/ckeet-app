'use client';

import { useEffect, useState, useCallback } from 'react';
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
      duration: 2 * 60 * 1000, // Reduzido para 2 minutos para atualizar cores mais rapidamente
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

  // Estados para orders (SEM cache para atualização instantânea)
  interface PurchaseItemRaw {
    id: string;
    orderNumber: string;
    orderId: string;
    productId: string;
    productName: string;
    productDescription?: string;
    productPrice: number;
    quantity: number;
    orderStatus: string;
    paymentStatus?: string;
    deliveredContent?: string;
    downloadUrl?: string;
    deliverables?: Array<{
      name: string;
      url: string;
    }>;
    expiresAt?: string;
    isDownloaded: boolean;
    downloadCount: number;
    storeName: string;
    storeSubdomain?: string;
    storePrimaryColor?: string;
    storeSecondaryColor?: string;
    createdAt: string;
    updatedAt: string;
    transactions?: Transaction[];
    latestTransaction?: Transaction;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    totalAmount: number;
    paymentMethod?: string;
  }

  interface OrdersData {
    purchases?: PurchaseItemRaw[];
    stats?: {
      totalOrders: number;
      totalPurchases: number;
      deliveredPurchases: number;
      pendingPurchases: number;
      paidOrders: number;
      totalDownloads: number;
      totalAmount: number;
    };
  }
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Função para buscar orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const accessToken = localStorage.getItem('customer_access_token');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/customer/orders/list?_t=' + Date.now(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      const data = await response.json();
      setOrdersData(data);
      setOrdersError(null);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setOrdersError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Buscar orders ao montar o componente
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fallback para refreshOrders (caso seja usado em outros lugares)
  const refreshOrders = () => {
    fetchOrders();
  };

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

    // Listener para detectar mudanças no localStorage (novas compras e mudanças na loja)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customer_access_token' || e.key?.includes('order') || e.key?.includes('store')) {
        // Invalidar cache quando há mudanças relacionadas a pedidos ou loja
        refreshOrders();
        // Também invalidar cache da loja se houver mudanças relacionadas à loja
        if (e.key?.includes('store')) {
          window.location.reload(); // Recarregar para pegar novas cores
        }
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

  // Função para verificar entrega de conteúdo
  const checkDelivery = useCallback(async () => {
    try {
      console.log('🔍 [POLLING] Verificando se há conteúdo para entregar...');
      const accessToken = localStorage.getItem('customer_access_token');
      if (!accessToken) {
        console.log('⚠️ [POLLING] Sem customer_access_token');
        return;
      }

      console.log('📡 [POLLING] Chamando /api/customer/orders/check-delivery');
      const response = await fetch('/api/customer/orders/check-delivery', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      console.log('📊 [POLLING] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [POLLING] Data recebida:', data);
        if (data.success && data.delivered > 0) {
          console.log('🎉 [POLLING] Conteúdo entregue! Atualizando página...');
          // Refresh orders para mostrar conteúdo entregue
          await fetchOrders();
        }
      }
    } catch (error) {
      console.error('❌ [POLLING] Erro:', error);
    }
  }, [fetchOrders]);

  // Checar apenas uma vez ao carregar a página
  useEffect(() => {
    checkDelivery();
  }, [checkDelivery]);

  useEffect(() => {
    if (ordersError) {
      // Só mostra erro se for um erro real de servidor (500) ou de autenticação (401/403)
      // Não mostra erro para usuários novos sem pedidos (que é normal)
      const errorMessage = ordersError || '';
      const isRealError = errorMessage.includes('Erro interno do servidor') || 
                         errorMessage.includes('Token de acesso é obrigatório') ||
                         errorMessage.includes('Token inválido') ||
                         errorMessage.includes('Customer não encontrado');
      
      if (isRealError) {
        showErrorToast('Erro ao carregar pedidos');
      }
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
    paidOrders: 0,
    totalDownloads: 0,
    totalAmount: 0
  };

  const tableData: OrderItem[] = purchases.map((purchase) => ({
    id: purchase.id,
    orderNumber: purchase.orderNumber,
    orderId: purchase.orderId,
    productId: purchase.productId,
    productName: purchase.productName,
    productDescription: purchase.productDescription,
    productPrice: purchase.productPrice,
    quantity: purchase.quantity,
    orderStatus: purchase.orderStatus,
    paymentStatus: purchase.paymentStatus || '',
    deliveredContent: purchase.deliveredContent || '',
    downloadUrl: purchase.downloadUrl,
    deliverables: purchase.deliverables?.map((d: { name: string; url: string }) => ({
      id: '',
      name: d.name,
      url: d.url
    })) || [],
    expiresAt: purchase.expiresAt,
    isDownloaded: purchase.isDownloaded,
    downloadCount: purchase.downloadCount,
    storeName: purchase.storeName,
    storeSubdomain: purchase.storeSubdomain || '',
    storePrimaryColor: purchase.storePrimaryColor,
    storeSecondaryColor: purchase.storeSecondaryColor,
    createdAt: purchase.createdAt,
    updatedAt: purchase.updatedAt,
    transactions: purchase.transactions || [],
    latestTransaction: purchase.latestTransaction,
    customerEmail: purchase.customerEmail,
    customerName: purchase.customerName || '',
    customerPhone: purchase.customerPhone || '',
    totalAmount: purchase.totalAmount,
    paymentMethod: purchase.paymentMethod || ''
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
      render: (value: unknown, item: OrderItem) => {
        // Só mostra "Entregue" se o pedido estiver pago E tiver conteúdo
        if (item.orderStatus === 'PAID' && value) {
          return 'Entregue';
        }
        return 'Pendente';
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
        if (item.orderStatus === 'PAID' && item.deliveredContent) {
          handleViewContent(item);
        } else {
          showErrorToast('Conteúdo ainda não foi entregue');
        }
      },
      show: (item: OrderItem) => item.orderStatus === 'PAID' && !!item.deliveredContent,
    },
    {
      icon: Copy,
      label: 'Copiar Conteúdo',
      onClick: (item: OrderItem) => {
        if (item.orderStatus === 'PAID' && item.deliveredContent) {
          handleCopyContent(item.deliveredContent);
        } else {
          showErrorToast('Conteúdo ainda não foi entregue');
        }
      },
      show: (item: OrderItem) => item.orderStatus === 'PAID' && !!item.deliveredContent,
    },
    {
      icon: Download,
      label: 'Download',
      onClick: (item: OrderItem) => {
        if (item.orderStatus === 'PAID') {
          if (item.downloadUrl) {
            handleDownload(item.id, item.downloadUrl);
          } else if (item.deliverables && item.deliverables.length > 0) {
            // Se não tem downloadUrl mas tem deliverables, usar o primeiro
            handleDownload(item.id, item.deliverables[0].url);
          } else {
            showErrorToast('Download não disponível');
          }
        } else {
          showErrorToast('Pedido ainda não foi pago');
        }
      },
      show: (item: OrderItem) => item.orderStatus === 'PAID' && !!(item.downloadUrl || (item.deliverables && item.deliverables.length > 0)),
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
            title="Pedidos pagos"
            value={ordersLoading ? '...' : stats.paidOrders}
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
                  <h2 className="text-xl font-semibold text-gray-900">Comprados</h2>
                </div>
                
                {/* Botão de Refresh */}
                <button
                  onClick={() => {
                    refreshOrders();
                    checkDelivery();
                  }}
                  disabled={ordersLoading}
                  className="cursor-pointer p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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