'use client';

import { useEffect, useState } from 'react';
import { Store, Order, Purchase, Product } from '@/lib/types';
import StoreNavbar from '../patterns/storeNavbar';
import Footer from '../patterns/footer';
import Table from '@/app/components/tables/table';
import { Download, Eye, Copy, CheckCircle } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

interface OrderWithDetails extends Order {
  products: (OrderItem & { product: Product })[];
  purchases: Purchase[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product: Product;
}

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>();

  useEffect(() => {
    fetchStoreData();
    checkAuthentication();
    fetchOrders();
  }, []);

  async function fetchStoreData() {
    try {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      const response = await fetch(`/api/storefront/store?subdomain=${subdomain}`);
      
      if (!response.ok) {
        throw new Error('Loja não encontrada');
      }

      const data = await response.json();
      setStore(data.store);
    } catch (error) {
      console.error('Erro ao carregar loja:', error);
    }
  }

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

  async function fetchOrders() {
    try {
      const accessToken = localStorage.getItem('customer_access_token');
      if (!accessToken) {
        showErrorToast('Você precisa estar logado para ver seus pedidos');
        return;
      }

      const response = await fetch('/api/customer/orders', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      showErrorToast('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
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

  const handleViewContent = (content: string) => {
    // Mostrar conteúdo em modal ou nova aba
    const newWindow = window.open('', '_blank', 'width=600,height=400');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>Conteúdo do Produto</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <h2>Conteúdo do Produto</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
              <pre style="white-space: pre-wrap; word-wrap: break-word;">${content}</pre>
            </div>
            <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #6200EE; color: white; border: none; border-radius: 4px; cursor: pointer;">Fechar</button>
          </body>
        </html>
      `);
    }
  };

  // Preparar dados para a tabela
  const tableData = orders.flatMap(order => 
    order.purchases.map(purchase => ({
      id: purchase.id,
      orderNumber: order.orderNumber,
      productName: order.products.find(p => p.orderId === order.id)?.product.name || 'Produto',
      deliveredContent: purchase.deliveredContent,
      downloadUrl: purchase.downloadUrl,
      isDownloaded: purchase.isDownloaded,
      downloadCount: purchase.downloadCount,
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
    }))
  );

  const columns = [
    {
      key: 'orderNumber' as keyof typeof tableData[0],
      label: 'Pedido',
      width: 'w-32',
      render: (value: unknown) => `#${value}`,
    },
    {
      key: 'productName' as keyof typeof tableData[0],
      label: 'Produto',
      width: 'w-48',
    },
    {
      key: 'deliveredContent' as keyof typeof tableData[0],
      label: 'Conteúdo',
      width: 'w-64',
      render: (value: unknown) => value ? 'Entregue' : 'Pendente',
    },
    {
      key: 'status' as keyof typeof tableData[0],
      label: 'Status',
      width: 'w-32',
      render: (value: unknown) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          PENDING: { text: 'Pendente', color: 'text-yellow-600' },
          PAID: { text: 'Pago', color: 'text-green-600' },
          DELIVERED: { text: 'Entregue', color: 'text-blue-600' },
          CANCELLED: { text: 'Cancelado', color: 'text-red-600' },
          REFUNDED: { text: 'Reembolsado', color: 'text-gray-600' },
        };
        const status = statusMap[value as string] || { text: value as string, color: 'text-gray-600' };
        return status.text;
      },
    },
    {
      key: 'createdAt' as keyof typeof tableData[0],
      label: 'Data',
      width: 'w-32',
      render: (value: unknown) => new Date(value as string).toLocaleDateString('pt-BR'),
    },
  ];

  const actions = [
    {
      icon: Eye,
      label: 'Ver Conteúdo',
      onClick: (item: typeof tableData[0]) => {
        if (item.deliveredContent) {
          handleViewContent(item.deliveredContent);
        } else {
          showErrorToast('Conteúdo ainda não foi entregue');
        }
      },
      show: (item: typeof tableData[0]) => !!item.deliveredContent,
    },
    {
      icon: Copy,
      label: 'Copiar Conteúdo',
      onClick: (item: typeof tableData[0]) => {
        if (item.deliveredContent) {
          handleCopyContent(item.deliveredContent);
        } else {
          showErrorToast('Conteúdo ainda não foi entregue');
        }
      },
      show: (item: typeof tableData[0]) => !!item.deliveredContent,
    },
    {
      icon: Download,
      label: 'Download',
      onClick: (item: typeof tableData[0]) => {
        if (item.downloadUrl) {
          handleDownload(item.id, item.downloadUrl);
        } else {
          showErrorToast('Download não disponível');
        }
      },
      show: (item: typeof tableData[0]) => !!item.downloadUrl,
    },
  ];

  if (loading) {
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
            <p className="text-gray-600 mb-4">Você precisa estar logado para ver seus pedidos.</p>
            <button
              onClick={() => window.location.href = '/shop/auth/login'}
              className="px-6 py-3 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: store.primaryColor || '#6200EE' }}
            >
              Fazer Login
            </button>
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
        onLogoutClick={() => window.location.href = '/shop/auth/logout'}
      />

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: store.primaryColor || '#6200EE' }}
            >
              Meus Pedidos
            </h1>
            <p className="text-gray-600">
              Gerencie seus produtos comprados e acesse o conteúdo
            </p>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${store.primaryColor || '#6200EE'}10` }}
                >
                  <CheckCircle 
                    size={24} 
                    style={{ color: store.primaryColor || '#6200EE' }}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${store.secondaryColor || '#03DAC6'}10` }}
                >
                  <Download 
                    size={24} 
                    style={{ color: store.secondaryColor || '#03DAC6' }}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Produtos Entregues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tableData.filter(item => item.deliveredContent).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${store.primaryColor || '#6200EE'}10` }}
                >
                  <Eye 
                    size={24} 
                    style={{ color: store.primaryColor || '#6200EE' }}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Downloads Realizados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tableData.reduce((sum, item) => sum + (item.downloadCount || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Pedidos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Produtos Comprados</h2>
              <p className="text-sm text-gray-600 mt-1">
                Clique nas ações para acessar seu conteúdo
              </p>
            </div>
            
            <div className="p-6">
              <Table
                data={tableData}
                columns={columns}
                actions={actions}
                itemsPerPage={10}
                emptyMessage="Nenhum pedido encontrado. Faça sua primeira compra!"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer store={store} />
    </div>
  );
}