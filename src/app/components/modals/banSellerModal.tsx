'use client';

import { useState } from 'react';
import { X, Shield } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface BanSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  lojaName: string;
  action: 'ban' | 'unban';
}

export default function BanSellerModal({
  isOpen,
  onClose,
  onConfirm,
  lojaName,
  action
}: BanSellerModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isBanning = action === 'ban';
  const title = isBanning ? 'Bloquear loja' : 'Desbloquear loja';
  const message = isBanning
    ? `Tem certeza que deseja bloquear a loja "${lojaName}"?`
    : `Tem certeza que deseja desbloquear a loja "${lojaName}"?`;
  const description = isBanning
    ? 'O seller desta loja não poderá mais fazer login e a loja ficará inativa.'
    : 'O seller desta loja voltará a poder fazer login e a loja ficará ativa.';
  const confirmButtonText = isBanning ? 'Bloquear' : 'Desbloquear';

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
              {isLoading ? (isBanning ? 'Bloqueando...' : 'Desbloqueando...') : confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

