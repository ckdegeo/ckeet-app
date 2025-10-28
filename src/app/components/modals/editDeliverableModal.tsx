'use client';

import { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import Input from '@/app/components/inputs/input';

interface EditDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, url: string) => Promise<void>;
  currentName: string;
  currentUrl: string;
}

export default function EditDeliverableModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  currentName,
  currentUrl
}: EditDeliverableModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Resetar os valores quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setUrl(currentUrl);
      setError('');
    }
  }, [isOpen, currentName, currentUrl]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError('O nome não pode estar vazio');
      return;
    }

    if (!url.trim()) {
      setError('A URL não pode estar vazia');
      return;
    }

    if (name.trim() === currentName && url.trim() === currentUrl) {
      onClose();
      return;
    }

    if (!isLoading) {
      try {
        setIsLoading(true);
        setError('');
        await onConfirm(name.trim(), url.trim());
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
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Edit className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Editar Entregável
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
          <div className="space-y-4">
            <Input
              label="Nome do entregável"
              placeholder="Digite o nome do entregável..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              error={error.includes('nome') ? error : undefined}
            />
            <Input
              label="URL de download"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              error={error.includes('URL') ? error : undefined}
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
              disabled={isLoading || !name.trim() || !url.trim()}
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

