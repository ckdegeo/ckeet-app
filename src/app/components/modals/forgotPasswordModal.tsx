'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Input from '@/app/components/inputs/input';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import { showToastWithAutoClose } from '@/lib/utils/toastUtils';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSend = async () => {
    if (!email.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const result = await res.json();
      if (!res.ok) {
        showToastWithAutoClose('error', result?.error || 'Erro ao enviar email de recuperação', 5000);
        return;
      }
      showToastWithAutoClose('success', result?.message || 'Email de recuperação enviado!', 5000);
      handleClose();
    } catch (err) {
      showToastWithAutoClose('error', 'Erro ao enviar email de recuperação', 5000);
    } finally {
      setIsLoading(false);
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
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Recuperar senha
          </h2>
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
          <p className="text-sm text-[var(--on-background)] mb-4">
            Informe o email da sua conta. Enviaremos um link para redefinir sua senha.
          </p>
          <Input
            label="Email"
            placeholder="seuemail@exemplo.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
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
              onClick={handleSend}
              disabled={!email.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Enviando...' : 'Enviar link'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


