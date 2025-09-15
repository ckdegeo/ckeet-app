'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import IconOnlyButton from "../buttons/iconOnlyButton";
import Button from "../buttons/button";
import Description from "../inputs/description";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReportConfirmationModal(props: any) {
  const {
    isOpen,
    onClose,
    order,
    onConfirm
  } = props;
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setReason('');
      setIsSubmitting(false);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (error) {
      console.error('Erro ao enviar denúncia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    onClose();
  };

  if (!isOpen || !mounted || !order) return null;

  const modalContent = (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={handleCancel}
      />
      
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div 
          className="bg-[var(--surface)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--on-background)]/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--on-background)]/10">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Denunciar Entregável
            </h2>
            <IconOnlyButton
              icon={X}
              onClick={handleCancel}
            />
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-[var(--foreground)] font-medium">
                Deseja denunciar esse entregável?
              </p>
              <p className="text-sm text-[var(--on-background)]">
                Produto: {order.product}
              </p>
              <p className="text-xs text-[var(--on-background)]">
                ID: {order.id}
              </p>
            </div>

            <Description
              label="Motivo da denúncia"
              placeholder="Descreva o motivo da sua denúncia..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              showCharCount={true}
              required
            />

            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-[var(--error)] hover:bg-[var(--error)]/90"
                disabled={!reason.trim() || isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
