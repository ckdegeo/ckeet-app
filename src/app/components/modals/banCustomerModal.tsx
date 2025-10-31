'use client';

import { useState } from 'react';
import { X, Shield } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface BanCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  customerName: string;
  action: 'ban' | 'unban';
}

export default function BanCustomerModal({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  action
}: BanCustomerModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isBanning = action === 'ban';
  const title = isBanning ? 'Banir Cliente' : 'Desbanir Cliente';
  const message = isBanning
    ? `Tem certeza que deseja banir o cliente "${customerName}"?`
    : `Tem certeza que deseja desbanir o cliente "${customerName}"?`;
  const description = isBanning
    ? 'Este cliente não poderá mais realizar compras na sua loja.'
    : 'Este cliente voltará a poder realizar compras na sua loja.';
  const confirmButtonText = isBanning ? 'Banir' : 'Desbanir';

  const handleConfirm = async () => {
    if (!isLoading) {
      try {
        setIsLoading(true);
        await onConfirm();
        onClose();
      } catch (error) {
        // Erro já é tratado no componente pai
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isBanning 
                ? 'bg-red-100' 
                : 'bg-green-100'
            }`}>
              <Shield className={isBanning ? 'text-red-600' : 'text-green-600'} size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {title}
            </h2>
          </div>
          <IconOnlyButton
            icon={X}
            onClick={onClose}
            variant="surface"
            className="w-10 h-10"
            aria-label="Fechar modal"
          />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-[var(--foreground)] mb-2">
            {message}
          </p>
          <p className="text-[var(--on-background)] text-sm mb-6">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant={isBanning ? "error" : "primary"}
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (isBanning ? 'Banindo...' : 'Desbanindo...') : confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

