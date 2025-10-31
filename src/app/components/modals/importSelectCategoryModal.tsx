'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import Selector from '@/app/components/selectors/selector';
import { showErrorToast } from '@/lib/utils/toastUtils';

interface ImportSelectCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetCategoryId: string) => Promise<void> | void;
}

interface SellerCategoryOption {
  value: string;
  label: string;
}

export default function ImportSelectCategoryModal({
  isOpen,
  onClose,
  onConfirm
}: ImportSelectCategoryModalProps) {
  const [options, setOptions] = useState<SellerCategoryOption[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isOpen) return;
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem('access_token');
        const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : undefined;
        const res = await fetch('/api/seller/categories/list', { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar categorias');
        interface CategoryResponse {
          id: string;
          name: string;
        }
        const opts: SellerCategoryOption[] = (data?.categories || []).map((c: CategoryResponse) => ({ value: c.id, label: c.name }));
        setOptions(opts);
        setSelected(opts[0]?.value || '');
      } catch (e) {
        showErrorToast(e instanceof Error ? e.message : 'Erro ao carregar categorias');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!selected) return;
    await onConfirm(selected);
    onClose();
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
            Selecionar categoria da loja
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
        <div className="px-6 pb-6 space-y-4">
          <Selector
            label="Categoria da sua loja"
            options={options}
            value={selected}
            onChange={setSelected}
            className="bg-[var(--surface)]"
          />

          <div className="flex gap-3 mt-4">
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
              disabled={!selected || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Importando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


