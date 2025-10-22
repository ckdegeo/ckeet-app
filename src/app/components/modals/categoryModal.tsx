'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '@/app/components/inputs/input';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryName: string) => Promise<void>;
  editMode?: boolean;
  initialName?: string;
}

export default function CategoryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editMode = false,
  initialName = '' 
}: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);

  // Atualizar categoryName quando initialName mudar (modo de edição)
  useEffect(() => {
    if (isOpen) {
      setCategoryName(initialName);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (categoryName.trim() && !isLoading) {
      try {
        setIsLoading(true);
        await onSave(categoryName.trim());
        setCategoryName('');
        onClose();
      } catch (error) {
        // Erro já é tratado no hook
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setCategoryName('');
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
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {editMode ? 'Editar Categoria' : 'Nova Categoria'}
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
          <Input
            label="Nome da categoria"
            placeholder="Digite o nome da categoria"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
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
              onClick={handleSave}
              disabled={!categoryName.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}