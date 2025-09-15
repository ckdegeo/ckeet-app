'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../buttons/button";
import Input from "../inputs/input";

// Ícones SVG
const SecurityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="var(--secondary)" fillOpacity="0.2"/>
    <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="var(--secondary)" strokeWidth="2"/>
    <path d="M9 12L11 14L15 10" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="var(--secondary)" fillOpacity="0.2"/>
    <path d="M9 12L11 14L15 10" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const QrCodeIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="25" height="25" fill="var(--primary)"/>
    <rect x="85" y="10" width="25" height="25" fill="var(--primary)"/>
    <rect x="10" y="85" width="25" height="25" fill="var(--primary)"/>
    <rect x="45" y="45" width="30" height="30" fill="var(--primary)"/>
    <rect x="15" y="15" width="15" height="15" fill="white"/>
    <rect x="90" y="15" width="15" height="15" fill="white"/>
    <rect x="15" y="90" width="15" height="15" fill="white"/>
    <rect x="55" y="55" width="10" height="10" fill="white"/>
    {/* Pontos decorativos */}
    <rect x="40" y="20" width="3" height="3" fill="var(--primary)"/>
    <rect x="50" y="20" width="3" height="3" fill="var(--primary)"/>
    <rect x="60" y="20" width="3" height="3" fill="var(--primary)"/>
    <rect x="20" y="40" width="3" height="3" fill="var(--primary)"/>
    <rect x="20" y="50" width="3" height="3" fill="var(--primary)"/>
    <rect x="20" y="60" width="3" fill="var(--primary)"/>
    <rect x="85" y="40" width="3" height="3" fill="var(--primary)"/>
    <rect x="95" y="40" width="3" height="3" fill="var(--primary)"/>
    <rect x="105" y="40" width="3" height="3" fill="var(--primary)"/>
    <rect x="40" y="85" width="3" height="3" fill="var(--primary)"/>
    <rect x="50" y="95" width="3" height="3" fill="var(--primary)"/>
    <rect x="60" y="105" width="3" height="3" fill="var(--primary)"/>
  </svg>
);

interface PixModalProps {
  isOpen: boolean;
  onCancel: () => void;
  productPrice: number;
  pixCode?: string;
  onCopyPix?: (pixCode: string) => void;
  onVerifyPayment?: () => void;
  className?: string;
}

export default function PixModal({ 
  isOpen, 
  onCancel, 
  productPrice,
  pixCode = "00020126580014BR.GOV.BCB.PIX01364c2f6f6c-7b8a-4d5e-9f3e-1a2b3c4d5e6f7890520400005303986540599.905802BR5925NOME DO RECEBEDOR AQUI6014CIDADE AQUI62070503***6304",
  onCopyPix,
  onVerifyPayment,
  className = "" 
}: PixModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir fechamento do modal com ESC e controlar scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        // Modal não pode ser fechado com ESC
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll da página quando modal estiver aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      
      if (onCopyPix) {
        onCopyPix(pixCode);
      }
      
      // Reset do estado "copiado" após 2 segundos
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onMouseDown={(e) => e.preventDefault()} // Prevenir fechamento ao clicar fora
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div 
          className={`bg-[var(--surface)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}
          onMouseDown={(e) => e.stopPropagation()} // Permitir interação dentro do modal
        >
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4">
                <CheckIcon />
                <span className="font-medium">QR Code PIX Gerado</span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Escaneie o código para pagar</h2>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-white border-2 border-[var(--primary)] rounded-2xl mb-6 p-4 flex items-center justify-center shadow-lg">
                <QrCodeIcon />
              </div>
              
              <div className="text-center w-full space-y-4">
                <div className="bg-[var(--primary)]/5 rounded-xl p-4">
                  <p className="text-sm text-[var(--on-background)] mb-1">Valor a pagar</p>
                  <p className="text-3xl font-bold text-[var(--primary)]">
                    R$ {productPrice.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                
                {/* Campo de código PIX copia e cola */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--foreground)] text-left">
                    Ou copie o código PIX:
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={pixCode}
                        readOnly
                        className="text-xs font-mono cursor-pointer"
                        placeholder="Código PIX"
                      />
                    </div>
                    <button
                      onClick={handleCopyPix}
                      className="cursor-pointer px-3 py-2 bg-[var(--primary)] text-white rounded-full hover:opacity-90 transition-all flex items-center justify-center min-w-[44px]"
                      title="Copiar código PIX"
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-800">Como pagar:</p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <p>1. Abra o app do seu banco</p>
                    <p>2. Escaneie o QR Code ou cole o código PIX</p>
                    <p>3. Confirme o pagamento</p>
                    <p>4. Pronto! Você receberá a confirmação por e-mail</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <SecurityIcon />
                  <span className="text-sm font-medium">Ambiente criptografado e 100% seguro</span>
                </div>

                {/* Botão para cancelar compra */}
                <div className="pt-4 border-t border-[var(--thumb-off)]">
                  <button
                    onClick={onCancel}
                    className="cursor-pointer text-sm text-[var(--error)] hover:text-[var(--error)]/80 underline transition-colors"
                  >
                    Cancelar minha compra
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
