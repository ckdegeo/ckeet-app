'use client';

import { useState } from 'react';
import { ImageService } from '@/lib/services/imageService';

export interface UseImageUploadOptions {
  folder?: string;
  maxSize?: number;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setIsUploading(true);
    setError(null);

    try {
      // Validação de tamanho
      if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
        const errorMsg = `Arquivo muito grande. Tamanho máximo: ${options.maxSize}MB`;
        setError(errorMsg);
        options.onError?.(errorMsg);
        return null;
      }

      // Validação de tipo
      if (!file.type.startsWith('image/')) {
        const errorMsg = 'Por favor, selecione apenas arquivos de imagem';
        setError(errorMsg);
        options.onError?.(errorMsg);
        return null;
      }

      // Fazer upload
      const result = await ImageService.uploadImage(file, options.folder || 'store');

      if (result.success && result.url) {
        setUploadedUrl(result.url);
        options.onSuccess?.(result.url);
        return result.url;
      } else {
        const errorMsg = result.error || 'Erro no upload';
        setError(errorMsg);
        options.onError?.(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido no upload';
      setError(errorMsg);
      options.onError?.(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      const result = await ImageService.deleteImage(imageUrl);
      
      if (result.success) {
        setUploadedUrl(null);
        return true;
      } else {
        setError(result.error || 'Erro ao deletar imagem');
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar imagem';
      setError(errorMsg);
      return false;
    }
  };

  const reset = () => {
    setUploadedUrl(null);
    setError(null);
    setIsUploading(false);
  };

  return {
    uploadImage,
    deleteImage,
    reset,
    isUploading,
    uploadedUrl,
    error
  };
}
