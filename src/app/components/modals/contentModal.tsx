'use client';

import { useState } from 'react';
import { X, Package, Eye, Calendar, DollarSign, Copy, CheckCircle, Download, AlertCircle, Store } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import Input from '@/app/components/inputs/input';
import Badge from '@/app/components/ui/badge';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderNumber: string;
    productName: string;
    productDescription?: string;
    productPrice: number;
    deliveredContent: string;
    downloadUrl?: string;
    deliverables?: Array<{
      id: string;
      name: string;
      url: string;
    }>;
    orderStatus: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
    storeName: string;
    storePrimaryColor?: string;
    storeSecondaryColor?: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
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

export default function ContentModal({
  isOpen,
  onClose,
  orderData,
  primaryColor = '#bd253c',
  secondaryColor = '#970b27'
}: ContentModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Copiar conteúdo
  const copyContent = async () => {
    if (orderData.deliveredContent) {
      try {
        await navigator.clipboard.writeText(orderData.deliveredContent);
        setCopied(true);
        showSuccessToast('Conteúdo copiado');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar conteúdo:', error);
        showErrorToast('Erro ao copiar conteúdo');
      }
    }
  };

  // Download do entregável
  const handleDownload = async (url: string, filename?: string) => {
    try {
      // Verificar se a URL é válida
      if (!url || url.trim() === '') {
        throw new Error('URL de download não fornecida');
      }

      // Se for uma URL externa, abrir em nova aba
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // Para URLs externas, abrir em nova aba
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          throw new Error('Não foi possível abrir o download. Verifique se o bloqueador de pop-ups está desabilitado.');
        }
        showSuccessToast('Download aberto em nova aba!');
        return;
      }

      // Para URLs relativas ou internas, fazer fetch
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Verificar se o blob tem conteúdo
      if (blob.size === 0) {
        throw new Error('Arquivo vazio ou não encontrado');
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'entregavel';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      showSuccessToast('Download iniciado');
    } catch (error) {
      console.error('➤➤ Erro ao fazer download:', error);
      showErrorToast(`Erro ao fazer download: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
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
              <Eye size={20} style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Conteúdo
              </h2>
              <p className="text-sm text-[var(--on-background)]">
                Pedido {orderData.orderNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              status={orderData.orderStatus} 
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
                value={formatCurrency(orderData.totalAmount)}
                icon={DollarSign}
                highlight
              />
            </div>

            {/* Data */}
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4">
              <InfoCard
                label="Data do pedido"
                value={formatDate(orderData.createdAt)}
                icon={Calendar}
              />
            </div>

            {/* Status do Pedido */}
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4">
              <InfoCard
                label="Status do pedido"
                value={
                  <Badge 
                    status={orderData.orderStatus} 
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                  />
                }
              />
            </div>

            {/* Status do Pagamento */}
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4">
              <InfoCard
                label="Status do pagamento"
                value={
                  <Badge 
                    status={orderData.paymentStatus} 
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

          {/* Informações da Loja */}
          <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-[var(--on-background)]" />
              <h3 className="font-semibold text-[var(--foreground)]">Loja</h3>
            </div>
            <div className="space-y-3">
              <InfoCard label="Nome" value={orderData.storeName} />
            </div>
          </div>

          {/* Conteúdo Entregue */}
          {orderData.deliveredContent ? (
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-[var(--foreground)]">Conteúdo entregue</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={orderData.deliveredContent}
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
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">Conteúdo pendente</h4>
                  <p className="text-sm text-yellow-800">
                    Conteúdo ainda não foi entregue. Aguarde a confirmação do pagamento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Entregáveis para Download */}
          {(orderData.downloadUrl || (orderData.deliverables && orderData.deliverables.length > 0)) && (
            <div className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-[var(--foreground)]">Downloads disponíveis</h3>
              <div className="space-y-2">
                {/* Download URL principal */}
                {orderData.downloadUrl && (
                  <div className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--on-background)]/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <Download size={16} style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)]">Arquivo</span>
                    </div>
                    <button
                      onClick={() => handleDownload(orderData.downloadUrl!, 'entregavel')}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Download
                    </button>
                  </div>
                )}

                {/* Deliverables */}
                {orderData.deliverables && orderData.deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--on-background)]/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}15` }}
                      >
                        <Download size={16} style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)]">{deliverable.name}</span>
                    </div>
                    <button
                      onClick={() => handleDownload(deliverable.url, deliverable.name)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      Download
                    </button>
                  </div>
                ))}
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
