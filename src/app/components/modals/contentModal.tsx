'use client';

import { useState } from 'react';
import { X, Copy, Download, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import Input from '@/app/components/inputs/input';
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
        showSuccessToast('Conteúdo copiado!');
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
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'entregavel';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      showSuccessToast('Download iniciado!');
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      showErrorToast('Erro ao fazer download');
    }
  };

  // Formatar status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      PENDING: { text: 'Pendente', color: 'text-yellow-600' },
      PAID: { text: 'Pago', color: 'text-green-600' },
      DELIVERED: { text: 'Entregue', color: 'text-blue-600' },
      CANCELLED: { text: 'Cancelado', color: 'text-red-600' },
      REFUNDED: { text: 'Reembolsado', color: 'text-gray-600' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-600' };
  };

  const orderStatus = formatStatus(orderData.orderStatus);
  const paymentStatus = formatStatus(orderData.paymentStatus);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          '--primary': primaryColor,
          '--secondary': secondaryColor,
          '--background': '#ffffff',
          '--foreground': '#111827',
          '--on-background': '#6b7280',
          '--on-primary': '#ffffff'
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Eye size={20} style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Conteúdo
              </h2>
              <p className="text-sm text-[var(--on-background)]">
                Pedido {orderData.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações do Pedido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-[var(--foreground)] mb-2">Informações do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--on-background)]">Produto:</span>
                  <span className="font-medium">{orderData.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--on-background)]">Valor:</span>
                  <span className="font-medium" style={{ color: primaryColor }}>
                    R$ {orderData.totalAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--on-background)]">Data:</span>
                  <span className="font-medium">
                    {new Date(orderData.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-[var(--foreground)] mb-2">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--on-background)]">Pedido:</span>
                  <span className={`font-medium ${orderStatus.color}`}>
                    {orderStatus.text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--on-background)]">Pagamento:</span>
                  <span className={`font-medium ${paymentStatus.color}`}>
                    {paymentStatus.text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--on-background)]">Loja:</span>
                  <span className="font-medium">{orderData.storeName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Entregue */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Entregável
            </label>
            <div className="flex gap-2">
              <Input
                value={orderData.deliveredContent || 'Conteúdo não disponível'}
                readOnly
                className="flex-1"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
              <button
                onClick={copyContent}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{ 
                  backgroundColor: secondaryColor,
                  color: 'white'
                }}
                title="Copiar conteúdo"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Descrição do Produto */}
          {orderData.productDescription && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Descrição
              </label>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-[var(--on-background)]">
                  {orderData.productDescription}
                </p>
              </div>
            </div>
          )}

          {/* Entregáveis para Download */}
          {(orderData.downloadUrl || (orderData.deliverables && orderData.deliverables.length > 0)) && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Download
              </label>
              <div className="space-y-2">
                {/* Download URL principal */}
                {orderData.downloadUrl && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <Download size={16} style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm font-medium">Arquivo principal</span>
                    </div>
                    <button
                      onClick={() => handleDownload(orderData.downloadUrl!, 'entregavel')}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: 'white'
                      }}
                    >
                      Download
                    </button>
                  </div>
                )}

                {/* Deliverables */}
                {orderData.deliverables && orderData.deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <Download size={16} style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm font-medium">{deliverable.name}</span>
                    </div>
                    <button
                      onClick={() => handleDownload(deliverable.url, deliverable.name)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      style={{ 
                        backgroundColor: primaryColor,
                        color: 'white'
                      }}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aviso se não há conteúdo */}
          {!orderData.deliveredContent && !orderData.downloadUrl && (!orderData.deliverables || orderData.deliverables.length === 0) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Conteúdo ainda não foi entregue. Aguarde a confirmação do pagamento.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="px-6"
              style={{ backgroundColor: secondaryColor }}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
