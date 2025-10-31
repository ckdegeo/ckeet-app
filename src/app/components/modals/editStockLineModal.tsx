'use client';

import { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import Input from '@/app/components/inputs/input';

interface EditStockLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (content: string) => Promise<void>;
  currentContent: string;
}

export default function EditStockLineModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  currentContent 
}: EditStockLineModalProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Resetar o conteúdo quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setContent(currentContent);
      setError('');
    }
  }, [isOpen, currentContent]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!content.trim()) {
      setError('O conteúdo não pode estar vazio');
      return;
    }

    if (content.trim() === currentContent) {
      onClose();
      return;
    }

    if (!isLoading) {
      try {
        setIsLoading(true);
        setError('');
        await onConfirm(content.trim());
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Edit className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Editar Linha de Estoque
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
          <div className="mb-4">
            <Input
              label="Conteúdo da linha de estoque"
              placeholder="Digite o conteúdo da linha de estoque..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              error={error}
              className="font-mono text-sm"
            />
          </div>

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
              disabled={isLoading || !content.trim()}
              className={`flex-1 ${isLoading ? 'animate-pulse' : ''}`}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

