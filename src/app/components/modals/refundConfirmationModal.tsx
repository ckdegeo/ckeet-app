'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '@/app/components/inputs/input';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface RefundConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  orderNumber: string;
  amount: number;
}

export default function RefundConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  amount
}: RefundConfirmationModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!password.trim() || isLoading) return;
    try {
      setIsLoading(true);
      await onConfirm(password.trim());
      setPassword('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Reembolsar pedido
          </h2>
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
          <div className="text-sm text-[var(--foreground-secondary)] mb-6">
            <div className="mb-3">
              Tem certeza que deseja reembolsar este pedido?
            </div>
            <div className="bg-[var(--surface-secondary)] rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-secondary)]">Pedido:</span>
                <span className="font-semibold text-[var(--foreground)]">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-secondary)]">Valor:</span>
                <span className="font-semibold text-[var(--foreground)]">R$ {amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <Input
            label="Senha da conta"
            placeholder="Digite sua senha para confirmar"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
            autoFocus
          />

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!password.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


