'use client';

import { useState, useEffect } from 'react';
import { X, Package, User, Calendar, DollarSign, CreditCard, Copy, CheckCircle, Download } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import Input from '@/app/components/inputs/input';
import Badge from '@/app/components/ui/badge';

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
  primaryColor?: string;
  secondaryColor?: string;
}

// Componente de Skeleton para informações
function InfoSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-20 bg-[var(--on-background)]/10 rounded"></div>
      <div className="h-6 w-32 bg-[var(--on-background)]/10 rounded"></div>
    </div>
  );
}

// Componente de Card de Informação
function InfoCard({ 
  label, 
  value, 
  icon: Icon,
  highlight = false 
}: { 
  label: string; 
  value: string | React.ReactNode; 
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-[var(--on-background)]" />}
        <span className="text-sm font-medium text-[var(--on-background)]">{label}</span>
      </div>
      <div className={`text-base ${highlight ? 'font-bold text-[var(--primary)]' : 'font-medium text-[var(--foreground)]'}`}>
        {value}
      </div>
    </div>
  );
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  orderData,
  primaryColor = '#bd253c',
  secondaryColor = '#970b27'
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

  // Formatar data com hora
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
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-[var(--surface)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          '--primary': primaryColor,
          '--secondary': secondaryColor,
          '--background': '#ffffff',
          '--surface': '#ffffff',
          '--foreground': '#111827',
          '--on-background': '#6b7280',
          '--on-primary': '#ffffff'
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--on-background)]/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Package size={20} style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Detalhes do pedido
              </h2>
              <p className="text-sm text-[var(--on-background)]">
                {orderData.orderNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              status={orderData.status} 
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--on-background)]/10 hover:bg-[var(--on-background)]/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} className="text-[var(--on-background)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Principais - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor */}
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4">
              <InfoCard
                label="Valor total"
                value={formatCurrency(orderData.amount)}
                icon={DollarSign}
                highlight
              />
            </div>

            {/* Método de Pagamento */}
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4">
              <InfoCard
                label="Método de pagamento"
                value={formatPaymentMethod(orderData.paymentMethod)}
                icon={CreditCard}
              />
            </div>

            {/* Data */}
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4">
              <InfoCard
                label="Data do Pedido"
                value={formatDate(orderData.createdAt)}
                icon={Calendar}
              />
            </div>

            {/* Status */}
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4">
              <InfoCard
                label="Status"
                value={
                  <Badge 
                    status={orderData.status} 
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                  />
                }
              />
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-[var(--on-background)]" />
              <h3 className="font-semibold text-[var(--foreground)]">Produto</h3>
            </div>
            <div className="space-y-3">
              <InfoCard label="Nome" value={orderData.productName} />
              {orderData.productDescription && (
                <div className="pt-2 border-t border-[var(--on-background)]/10">
                  <InfoCard label="Descrição" value={orderData.productDescription} />
                </div>
              )}
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-[var(--on-background)]" />
              <h3 className="font-semibold text-[var(--foreground)]">Cliente</h3>
            </div>
            <div className="space-y-3">
              <InfoCard label="Nome" value={orderData.customerName} />
              <InfoCard label="E-mail" value={orderData.customerEmail} />
            </div>
          </div>

          {/* Conteúdo Entregue */}
          {isLoadingPurchase ? (
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-[18px] h-[18px] bg-[var(--on-background)]/10 rounded animate-pulse"></div>
                <div className="h-5 w-40 bg-[var(--on-background)]/10 rounded animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <InfoSkeleton />
                <div className="h-10 w-24 bg-[var(--on-background)]/10 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ) : purchaseContent && (
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-[var(--foreground)]">Conteúdo entregue</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={purchaseContent}
                      readOnly
                      className="font-mono text-sm"
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                    />
                  </div>
                  <button
                    onClick={copyContent}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
                    style={{ 
                      backgroundColor: secondaryColor,
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                {purchaseDownloadUrl && (
                  <a
                    href={purchaseDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    <Download size={16} />
                    Baixar conteúdo
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--on-background)]/10 bg-[var(--background)] rounded-b-2xl">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              variant="secondary"
              className="px-6 cursor-pointer"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
