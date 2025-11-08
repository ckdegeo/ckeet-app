'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '@/app/components/inputs/input';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionName: string) => Promise<void>;
  editMode?: boolean;
  initialName?: string;
}

export default function SectionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editMode = false,
  initialName = '' 
}: SectionModalProps) {
  const [sectionName, setSectionName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);

  // Atualizar sectionName quando initialName mudar (modo de edição)
  useEffect(() => {
    if (isOpen) {
      setSectionName(initialName);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (sectionName.trim() && !isLoading) {
      try {
        setIsLoading(true);
        await onSave(sectionName.trim());
        setSectionName('');
        onClose();
      } catch (error) {
        // Erro já é tratado no hook
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setSectionName('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
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
            {editMode ? 'Editar sessão' : 'Nova sessão'}
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
            label="Nome da sessão"
            placeholder="Digite o nome da sessão"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
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
              disabled={!sectionName.trim() || isLoading}
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

