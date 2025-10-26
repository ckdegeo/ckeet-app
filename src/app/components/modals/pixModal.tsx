'use client';

import { useState, useEffect } from 'react';
import { X, Copy, QrCode, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import Input from '@/app/components/inputs/input';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toastUtils';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  onPaymentSuccess?: (paymentData: PixPaymentData) => void;
}

interface PixPaymentData {
  qrCode: string;
  qrCodeText: string;
  expiresAt: string;
  paymentId: string;
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
}

interface OrderResponse {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: string;
  };
  pix: {
    qrCode: string;
    qrCodeText: string;
    paymentId: string;
    expiresAt: string;
  };
  split: {
    totalAmount: number;
    sellerAmount: number;
    platformAmount: number;
    commissionRate: number;
    commissionFixedFee: number;
  };
}

export default function PixModal({
  isOpen,
  onClose,
  productId,
  productName,
  productPrice,
  productImage,
  primaryColor = '#bd253c',
  secondaryColor = '#970b27',
  onPaymentSuccess
}: PixModalProps) {
  const [paymentData, setPaymentData] = useState<PixPaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');

  // Gerar PIX real via API
  const generatePixPayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar token de acesso do customer
      const accessToken = localStorage.getItem('customer_access_token');
      if (!accessToken) {
        throw new Error('Usuário não autenticado. Faça login para continuar.');
      }

      // Criar pedido e gerar PIX
      const response = await fetch('/api/customer/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pedido');
      }

      const orderData: OrderResponse = await response.json();
      
      if (!orderData.success) {
        throw new Error('Erro ao processar pedido');
      }

      // Converter dados da API para o formato do modal
      const pixData: PixPaymentData = {
        qrCode: orderData.pix.qrCode,
        qrCodeText: orderData.pix.qrCodeText,
        expiresAt: orderData.pix.expiresAt,
        paymentId: orderData.pix.paymentId,
        orderId: orderData.order.id,
        orderNumber: orderData.order.orderNumber,
        status: 'pending'
      };

      setPaymentData(pixData);
      setOrderNumber(orderData.order.orderNumber);
      
      // Calcular tempo restante (30 minutos)
      const expiresAt = new Date(orderData.pix.expiresAt);
      const now = new Date();
      const timeDiff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(timeDiff);
      
      console.log('✅ PIX gerado com sucesso:', {
        orderNumber: orderData.order.orderNumber,
        paymentId: orderData.pix.paymentId,
        totalAmount: orderData.order.totalAmount,
        split: orderData.split
      });

    } catch (error) {
      console.error('❌ Erro ao gerar PIX:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showErrorToast(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Contador regressivo
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Verificar status automaticamente a cada 10 segundos
  useEffect(() => {
    if (!paymentData || paymentData.status !== 'pending') return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [paymentData]);

  // Formatar tempo restante
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Copiar código PIX
  const copyPixCode = async () => {
    if (paymentData?.qrCodeText) {
      try {
        await navigator.clipboard.writeText(paymentData.qrCodeText);
        setCopied(true);
        showSuccessToast('Código PIX copiado!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar código PIX:', error);
        showErrorToast('Erro ao copiar código PIX');
      }
    }
  };


  // Verificar status do pagamento real
  const checkPaymentStatus = async () => {
    if (!paymentData?.orderId) return;
    
    try {
      const accessToken = localStorage.getItem('customer_access_token');
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch(`/api/customer/orders/status?orderId=${paymentData.orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao verificar status');
      }

      const statusData = await response.json();
      
      if (statusData.success) {
        const newStatus = statusData.order.paymentStatus === 'PAID' ? 'paid' : 
                         statusData.order.paymentStatus === 'FAILED' ? 'failed' : 'pending';
        
        setPaymentData(prev => prev ? { ...prev, status: newStatus } : null);
        
        if (newStatus === 'paid' && onPaymentSuccess) {
          onPaymentSuccess(paymentData);
        }
        
        console.log('📊 Status atualizado:', {
          orderNumber: statusData.order.orderNumber,
          status: statusData.order.status,
          paymentStatus: statusData.order.paymentStatus
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar pagamento';
      showErrorToast(errorMessage);
      setError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
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
              <QrCode size={20} style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Pagamento PIX
              </h2>
              <p className="text-sm text-[var(--on-background)]">
                {orderNumber || 'Aguardando...'}
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
        <div className="p-6">
          {/* Produto */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            {/* Imagem do produto */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {productImage ? (
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <QrCode size={24} className="text-gray-400" />
              )}
            </div>
            
            {/* Informações do produto */}
            <div className="flex-1">
              <h3 className="font-medium text-[var(--foreground)] mb-1">
                {productName}
              </h3>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                R$ {productPrice.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6"></div>

          {/* Status de Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: primaryColor }}></div>
              <p className="text-[var(--on-background)]">Gerando pagamento...</p>
            </div>
          )}

          {/* Erro - Agora exibido via toast */}
          {/* {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )} */}

          {/* Dados do PIX */}
          {paymentData && !isLoading && (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 inline-block">
                  <img
                    src={`data:image/png;base64,${paymentData.qrCode}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              </div>

              {/* Código PIX */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Código PIX
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData.qrCodeText}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-xs font-light mb-2"
                  />
                  <button
                    onClick={copyPixCode}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ 
                      backgroundColor: secondaryColor,
                      color: 'white'
                    }}
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timer e Status */}
          {paymentData && !isLoading && (
            <div className="mt-6 space-y-4">
              {/* Timer */}
              {timeLeft > 0 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Clock size={16} className="text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Expira em: <strong>{formatTime(timeLeft)}</strong>
                  </span>
                </div>
              )}

              {/* Status do Pagamento */}
              <div className="text-center">
                {paymentData.status === 'pending' && (
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Aguardando pagamento</span>
                  </div>
                )}
                {paymentData.status === 'paid' && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">Pagamento confirmado!</span>
                  </div>
                )}
                {paymentData.status === 'expired' && (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium">Pagamento expirado</span>
                  </div>
                )}
              </div>

              {/* Botão Verificar */}
              <Button
                onClick={checkPaymentStatus}
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                Verificar pagamento
              </Button>
            </div>
          )}

          {/* Botão único para gerar PIX ou tentar novamente */}
          {!paymentData && !isLoading && (
            <Button
              onClick={generatePixPayment}
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              {error ? 'Tentar novamente' : 'Gerar pagamento PIX'}
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="text-center">
            <p className="text-xs text-[var(--on-background)]">
              💡 Use o app do seu banco para escanear o QR Code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
