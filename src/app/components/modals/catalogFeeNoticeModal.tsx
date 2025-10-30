'use client';

import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import { X, AlertCircle } from 'lucide-react';

interface CatalogFeeNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CatalogFeeNoticeModal({ isOpen, onClose }: CatalogFeeNoticeModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-[var(--primary)]" size={20} />
            <h2 className="text-xl font-bold text-[var(--foreground)]">Aviso</h2>
          </div>
          <IconOnlyButton
            icon={X}
            onClick={onClose}
            variant="surface"
            className="w-10 h-10"
            aria-label="Fechar modal"
          />
        </div>
        
        <hr className="border-[var(--primary)]/10" />

        {/* Content */}
        <div className="px-6 pb-6 text-[var(--foreground)] space-y-4 mt-4">
          <p className="leading-relaxed">
            Ao importar itens do catálogo, cada venda terá a seguinte taxa da plataforma:
          </p>
          <div className="rounded-xl border border-[var(--on-background)]/30 bg-[var(--background)] p-4">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>40%</strong> do valor da venda</li>
              <li><strong>R$ 0,50</strong> por transação</li>
            </ul>
          </div>
          <p className="leading-relaxed">
            Essa taxa cobre o estoque e a infraestrutura fornecidos pela <strong>Ckeet</strong> para garantir disponibilidade imediata dos produtos.
          </p>
        </div>
      </div>
    </div>
  );
}


