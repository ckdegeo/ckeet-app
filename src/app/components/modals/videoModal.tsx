'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '@/app/components/inputs/input';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (videoData: { title: string; videoId: string }) => Promise<void>;
  editMode?: boolean;
  initialTitle?: string;
  initialVideoId?: string;
}

export default function VideoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editMode = false,
  initialTitle = '',
  initialVideoId = ''
}: VideoModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [videoUrl, setVideoUrl] = useState(initialVideoId ? `https://www.youtube.com/watch?v=${initialVideoId}` : '');
  const [isLoading, setIsLoading] = useState(false);

  // Atualizar valores quando mudarem (modo de edição)
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setVideoUrl(initialVideoId ? `https://www.youtube.com/watch?v=${initialVideoId}` : '');
    }
  }, [isOpen, initialTitle, initialVideoId]);

  if (!isOpen) return null;

  const extractVideoId = (url: string) => {
    if (!url || !url.trim()) return '';
    
    const trimmedUrl = url.trim();
    
    // Se for apenas um ID de vídeo (11 caracteres alfanuméricos e hífens)
    const videoIdPattern = /^[\w-]{11}$/;
    if (videoIdPattern.test(trimmedUrl)) {
      return trimmedUrl;
    }
    
    // Se for uma URL do YouTube, extrair o ID
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
    const match = trimmedUrl.match(regExp);
    return (match && match[1]) ? match[1] : '';
  };

  const handleSave = async () => {
    const videoId = extractVideoId(videoUrl);
    if (title.trim() && videoId && !isLoading) {
      try {
        setIsLoading(true);
        await onSave({ title: title.trim(), videoId });
        setTitle('');
        setVideoUrl('');
        onClose();
      } catch (error) {
        // Erro já é tratado no componente pai
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setTitle('');
    setVideoUrl('');
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
            {editMode ? 'Editar vídeo' : 'Adicionar vídeo'}
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
        <div className="px-6 pb-6 space-y-4">
          <Input
            label="Título do vídeo"
            placeholder="Digite o título do vídeo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <Input
            label="URL do YouTube"
            placeholder="Ex: https://www.youtube.com/watch?v=VIDEO_ID"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />

          <p className="text-xs text-[var(--on-background)]">
            Você pode colar o ID do vídeo (ex: D_LZCXmIwrA) ou a URL completa do YouTube
          </p>

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
              disabled={!title.trim() || !extractVideoId(videoUrl) || isLoading}
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

