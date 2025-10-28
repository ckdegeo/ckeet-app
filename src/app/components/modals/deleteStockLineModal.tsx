'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface DeleteStockLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  content: string;
}

export default function DeleteStockLineModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  content 
}: DeleteStockLineModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!isLoading) {
      try {
        setIsLoading(true);
        await onConfirm();
        onClose();
      } catch (error) {
        // Erro já é tratado na função
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Excluir Linha de Estoque
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
          <p className="text-[var(--on-background)] mb-2">
            Tem certeza que deseja excluir a linha de estoque:
          </p>
          <p className="font-semibold text-[var(--foreground)] mb-4 font-mono text-sm bg-[var(--background)] p-3 rounded-lg border border-[var(--on-background)]/10">
            &ldquo;{content}&rdquo;
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

