'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Download, QrCode, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/app/components/buttons/button';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productPrice: number;
  orderNumber: string;
  primaryColor?: string;
  secondaryColor?: string;
  onPaymentSuccess?: (paymentData: PixPaymentData) => void;
}

interface PixPaymentData {
  qrCode: string;
  qrCodeText: string;
  expiresAt: string;
  paymentId: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
}

export default function PixModal({
  isOpen,
  onClose,
  productName,
  productPrice,
  orderNumber,
  primaryColor = '#6200EE',
  secondaryColor = '#03DAC6',
  onPaymentSuccess
}: PixModalProps) {
  const [paymentData, setPaymentData] = useState<PixPaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Simular geração de PIX (será substituído pela integração real)
  const generatePixPayment = async () => {
    setIsLoading(true);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dados simulados do PIX
    const mockPaymentData: PixPaymentData = {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      qrCodeText: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913LOJA EXEMPLO6008BRASILIA62070503***6304',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      paymentId: `pix_${Date.now()}`,
      status: 'pending'
    };
    
    setPaymentData(mockPaymentData);
    setTimeLeft(30 * 60); // 30 minutos em segundos
    setIsLoading(false);
  };

  // Contador regressivo
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

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
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Erro ao copiar código PIX:', error);
      }
    }
  };

  // Baixar QR Code
  const downloadQrCode = () => {
    if (paymentData?.qrCode) {
      const link = document.createElement('a');
      link.href = paymentData.qrCode;
      link.download = `pix-${orderNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Verificar status do pagamento (simulado)
  const checkPaymentStatus = async () => {
    // Em implementação real, faria polling para verificar status
    console.log('Verificando status do pagamento...');
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
                {orderNumber}
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
          {/* Produto */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              {productName}
            </h3>
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              R$ {productPrice.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* Status de Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: primaryColor }}></div>
              <p className="text-[var(--on-background)]">Gerando pagamento PIX...</p>
            </div>
          )}

          {/* Dados do PIX */}
          {paymentData && !isLoading && (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 inline-block">
                  <img
                    src={paymentData.qrCode}
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-[var(--on-background)] mt-2">
                  Escaneie o QR Code com seu app bancário
                </p>
              </div>

              {/* Código PIX */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--foreground)]">
                  Código PIX (Copiar e colar)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData.qrCodeText}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-xs"
                  />
                  <Button
                    onClick={copyPixCode}
                    className="px-3 py-2"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              {/* Timer */}
              {timeLeft > 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  onClick={downloadQrCode}
                  className="flex-1"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: primaryColor,
                    color: primaryColor,
                    border: `2px solid ${primaryColor}`
                  }}
                >
                  <Download size={16} className="mr-2" />
                  Baixar QR Code
                </Button>
                <Button
                  onClick={checkPaymentStatus}
                  className="flex-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  Verificar Pagamento
                </Button>
              </div>
            </div>
          )}

          {/* Botão para gerar PIX */}
          {!paymentData && !isLoading && (
            <Button
              onClick={generatePixPayment}
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              Gerar Pagamento PIX
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="text-center">
            <p className="text-xs text-[var(--on-background)] mb-2">
              💡 Dica: Use o app do seu banco para escanear o QR Code
            </p>
            <p className="text-xs text-[var(--on-background)]">
              O pagamento é processado instantaneamente via PIX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
