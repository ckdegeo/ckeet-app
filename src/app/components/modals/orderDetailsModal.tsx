'use client';

import { useState, useEffect } from 'react';
import { X, Package, User, ShoppingCart, Calendar, DollarSign, CreditCard, Info, Key, Copy, CheckCircle } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import Input from '@/app/components/inputs/input';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    orderNumber: string;
    productName: string;
    productDescription?: string;
    customerName: string;
    customerEmail: string;
    status: string;
    paymentMethod: string;
    amount: number;
    createdAt: string;
  };
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderData
}: OrderDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [purchaseContent, setPurchaseContent] = useState<string | null>(null);
  const [purchaseDownloadUrl, setPurchaseDownloadUrl] = useState<string | null>(null);
  const [isLoadingPurchase, setIsLoadingPurchase] = useState(false);

  // Buscar purchase quando o modal abrir
  useEffect(() => {
    if (isOpen && orderData.orderId) {
      fetchPurchase();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchPurchase = async () => {
    try {
      setIsLoadingPurchase(true);
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        return;
      }

      const response = await fetch(`/api/seller/orders/${orderData.orderId}/purchase`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setPurchaseContent(result.data.deliveredContent || null);
          setPurchaseDownloadUrl(result.data.downloadUrl || null);
        }
      }
    } catch (error) {
      console.error('❌ [MODAL] Erro ao buscar purchase:', error);
    } finally {
      setIsLoadingPurchase(false);
    }
  };

  if (!isOpen) return null;

  // Copiar conteúdo
  const copyContent = async () => {
    if (purchaseContent) {
      try {
        await navigator.clipboard.writeText(purchaseContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar conteúdo:', error);
      }
    }
  };

  // Formatar status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      PENDING: { text: 'Pendente', color: 'text-orange-600', bgColor: 'bg-orange-100' },
      PAID: { text: 'Pago', color: 'text-green-600', bgColor: 'bg-green-100' },
      CANCELLED: { text: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-100' },
      REFUNDED: { text: 'Reembolsado', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const statusConfig = formatStatus(orderData.status);

  // Formatar forma de pagamento
  const formatPaymentMethod = (method: string) => {
    const methodMap: Record<string, string> = {
      CREDIT_CARD: 'Cartão de Crédito',
      DEBIT_CARD: 'Cartão de Débito',
      PIX: 'PIX',
      BOLETO: 'Boleto',
      TRANSFER: 'Transferência'
    };
    return methodMap[method] || method;
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary)] bg-opacity-10">
              <ShoppingCart size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Detalhes
              </h2>
              <p className="text-sm text-[var(--on-background)]">
                {orderData.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações do Produto */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Package size={18} />
                <h3 className="font-semibold text-[var(--foreground)]">Produto</h3>
              </div>
              {/* Status Badge */}
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} border border-current border-opacity-20`}>
                {statusConfig.text}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Nome:</span>
                <p className="font-medium text-[var(--foreground)]">{orderData.productName}</p>
              </div>
              {orderData.productDescription && (
                <div>
                  <span className="text-sm text-gray-600">Descrição:</span>
                  <p className="text-sm text-[var(--on-background)]">{orderData.productDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={18} />
              <h3 className="font-semibold text-[var(--foreground)]">Cliente</h3>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Nome:</span>
                <p className="font-medium text-[var(--foreground)]">{orderData.customerName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">E-mail:</span>
                <p className="font-medium text-[var(--foreground)]">{orderData.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Informações de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign size={18} />
                <h3 className="font-semibold text-[var(--foreground)]">Valor</h3>
              </div>
              <p className="text-2xl font-bold text-[var(--primary)]">
                {formatCurrency(orderData.amount)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <CreditCard size={18} />
                <h3 className="font-semibold text-[var(--foreground)]">Pagamento</h3>
              </div>
              <p className="font-medium text-[var(--foreground)]">
                {formatPaymentMethod(orderData.paymentMethod)}
              </p>
            </div>
          </div>

          {/* Informações de Data */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar size={18} />
              <h3 className="font-semibold text-[var(--foreground)]">Data do Pedido</h3>
            </div>
            <p className="font-medium text-[var(--foreground)]">
              {formatDate(orderData.createdAt)}
            </p>
          </div>

          {/* Conteúdo Entregue */}
          {isLoadingPurchase ? (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-[18px] h-[18px] bg-[var(--on-background)]/10 rounded"></div>
                <div className="h-5 w-40 bg-[var(--on-background)]/10 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-full bg-[var(--on-background)]/10 rounded-lg"></div>
                <div className="h-10 w-24 bg-[var(--on-background)]/10 rounded-lg"></div>
              </div>
            </div>
          ) : purchaseContent && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Key size={18} />
                <h3 className="font-semibold text-[var(--foreground)]">Conteúdo entregue</h3>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={purchaseContent}
                      readOnly
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={copyContent}
                    variant="primary"
                    className="px-4 py-2 flex items-center gap-2"
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
                {purchaseDownloadUrl && (
                  <a
                    href={purchaseDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Download disponível
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Aviso para o Seller */}
          {orderData.status === 'PAID' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Pedido confirmado</h4>
                  <p className="text-sm text-blue-800">
                    Este pedido foi pago e confirmado. O conteúdo deve ser entregue ao cliente.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="px-6 cursor-pointer"
              style={{ backgroundColor: '#970b27' }}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
