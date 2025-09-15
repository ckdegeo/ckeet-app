'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, QrCode, CreditCard, Copy, Check } from "lucide-react";
import Button from "../buttons/button";
import IconOnlyButton from "../buttons/iconOnlyButton";
import Input from "../inputs/input";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PaymentModal(props: any) {
  const {
    isOpen,
    onClose,
    productName,
    productPrice,
    onPaymentConfirm
  } = props;
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [pixCode] = useState("00020126580014BR.GOV.BCB.PIX01364c2f6f6c-7b8a-4d5e-9f3e-1a2b3c4d5e6f7890520400005303986540599.905802BR5925MERCADO PAGO6014SAO PAULO62070503***6304");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err);
    }
  };

  const handlePaymentConfirm = () => {
    onPaymentConfirm?.();
    onClose();
  };

  const handleCheckout = () => {
    window.open('https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=example', '_blank');
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div 
          className="bg-[var(--surface)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--on-background)]/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--on-background)]/10">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Pagamento
            </h2>
            <IconOnlyButton
              icon={X}
              onClick={onClose}
            />
          </div>

          <div className="p-6 space-y-6">
            {/* Valor */}
            <div className="text-center">
              <span className="text-3xl font-bold text-[var(--primary)]">
                R$ {productPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Método de Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'pix'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--on-background)]/20'
                }`}
              >
                <QrCode 
                  size={24} 
                  className={paymentMethod === 'pix' ? 'text-[var(--primary)]' : 'text-[var(--on-background)]'}
                />
                <span className={`text-sm font-medium ${paymentMethod === 'pix' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                  PIX
                </span>
              </button>

              <button
                onClick={() => setPaymentMethod('checkout')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'checkout'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--on-background)]/20'
                }`}
              >
                <CreditCard 
                  size={24} 
                  className={paymentMethod === 'checkout' ? 'text-[var(--primary)]' : 'text-[var(--on-background)]'}
                />
                <span className={`text-sm font-medium ${paymentMethod === 'checkout' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
                  Checkout
                </span>
              </button>
            </div>

            {/* Conteúdo */}
            {paymentMethod === 'pix' ? (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="w-full max-w-[280px] aspect-square bg-white border border-[var(--on-background)]/20 rounded-xl p-4 flex items-center justify-center">
                    <svg width="100%" height="100%" viewBox="0 0 140 140" fill="none">
                      <rect x="8" y="8" width="30" height="30" fill="var(--primary)"/>
                      <rect x="102" y="8" width="30" height="30" fill="var(--primary)"/>
                      <rect x="8" y="102" width="30" height="30" fill="var(--primary)"/>
                      <rect x="55" y="55" width="30" height="30" fill="var(--primary)"/>
                      <rect x="15" y="15" width="16" height="16" fill="white"/>
                      <rect x="109" y="15" width="16" height="16" fill="white"/>
                      <rect x="15" y="109" width="16" height="16" fill="white"/>
                      <rect x="62" y="62" width="16" height="16" fill="white"/>
                      {/* Pontos decorativos */}
                      <rect x="45" y="20" width="3" height="3" fill="var(--primary)"/>
                      <rect x="55" y="20" width="3" height="3" fill="var(--primary)"/>
                      <rect x="65" y="20" width="3" height="3" fill="var(--primary)"/>
                      <rect x="20" y="45" width="3" height="3" fill="var(--primary)"/>
                      <rect x="20" y="55" width="3" height="3" fill="var(--primary)"/>
                      <rect x="20" y="65" width="3" height="3" fill="var(--primary)"/>
                      <rect x="115" y="45" width="3" height="3" fill="var(--primary)"/>
                      <rect x="125" y="45" width="3" height="3" fill="var(--primary)"/>
                      <rect x="45" y="115" width="3" height="3" fill="var(--primary)"/>
                      <rect x="55" y="125" width="3" height="3" fill="var(--primary)"/>
                    </svg>
                  </div>
                </div>

                {/* Código PIX */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={pixCode}
                      readOnly
                      className="text-xs font-mono"
                    />
                    <IconOnlyButton
                      icon={copied ? Check : Copy}
                      onClick={handleCopyPix}
                      variant={copied ? "primary" : "default"}
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePaymentConfirm}
                  className="w-full"
                >
                  Confirmar Pagamento
                </Button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard size={32} className="text-[var(--primary)]" />
                </div>
                
                <p className="text-sm text-[var(--on-background)]">
                  Cartão, débito ou boleto
                </p>

                <Button
                  onClick={handleCheckout}
                  className="w-full"
                >
                  Ir para Checkout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
