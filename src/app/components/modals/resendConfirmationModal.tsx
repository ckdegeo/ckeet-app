'use client';

import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import Input from '@/app/components/inputs/input';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface ResendConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResend: (email: string) => Promise<void>;
  initialEmail?: string;
}

export default function ResendConfirmationModal({ 
  isOpen, 
  onClose, 
  onResend,
  initialEmail = '' 
}: ResendConfirmationModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleResend = async () => {
    if (email.trim() && !isLoading) {
      try {
        setIsLoading(true);
        await onResend(email.trim());
        onClose();
      } catch (error) {
        // Erro já é tratado no componente pai
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setEmail(initialEmail);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
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
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Reenviar confirmação
            </h2>
          </div>
          <IconOnlyButton
            icon={X}
            onClick={handleClose}
            variant="surface"
            className="w-10 h-10"
            aria-label="Fechar modal"
          />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-[var(--on-background)] text-sm mb-4">
            Digite seu email para reenviar o link de confirmação da conta.
          </p>
          
          <Input
            label="Email"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleResend();
              }
            }}
            autoFocus
          />

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleResend}
              disabled={!email.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Enviando...' : 'Reenviar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
