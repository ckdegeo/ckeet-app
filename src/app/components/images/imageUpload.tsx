'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../buttons/button';
import { ImageService } from '@/lib/services/imageService';
import LoadingSpinner from '@/app/components/ui/loadingSpinner';

// Props do componente ImageUpload
interface ImageUploadProps {
  label: string;
  value: File | null | { url: string }; // Suporta File ou objeto com URL
  onChange: (file: File | null, url?: string) => void;
  accept?: string;
  maxSize?: number;
  error?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  folder?: string; // Pasta no bucket para organizar as imagens
  uploadType?: 'store' | 'product'; // Tipo de upload
  productId?: string; // ID do produto (para produtos)
  imageType?: 'image1' | 'image2' | 'image3'; // Tipo da imagem do produto
}

export default function ImageUpload({
  label,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5, // 5MB por padrão
  error,
  className = "",
  placeholder = "Clique para fazer upload ou arraste uma imagem",
  disabled = false,
  folder = "store",
  uploadType = "store",
  productId,
  imageType = "image1"
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determinar se há uma imagem existente (URL) ou nova (File)
  const hasExistingImage = value && typeof value === 'object' && 'url' in value;
  const existingImageUrl = hasExistingImage ? value.url : null;
  const currentImageUrl = uploadedUrl || existingImageUrl;
  const hasImage = !!(preview || currentImageUrl);
  const isActive = isFocused || isDragOver || hasImage;

  const handleFileSelect = async (file: File) => {
    if (disabled) return;

    // Validação de tamanho
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    setIsUploading(true);

    try {
      // Criar preview local primeiro
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        setPreview(result as string);
      };
      reader.readAsDataURL(file);

      // Fazer upload para o Supabase
      let uploadResult;
      
      if (uploadType === 'product') {
        // Upload de imagem de produto
        uploadResult = await ImageService.uploadProductImage(file, productId, imageType);
      } else {
        // Upload de imagem de loja
        uploadResult = await ImageService.uploadImage(file, folder);
      }
      
      if (uploadResult.success && uploadResult.url) {
        setUploadedUrl(uploadResult.url);
        onChange?.(file, uploadResult.url);
      } else {
        alert(`Erro no upload: ${uploadResult.error}`);
        setPreview(null);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro no upload da imagem');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = async () => {
    // Deletar imagem do Supabase se for uma URL válida
    if (currentImageUrl && ImageService.isSupabaseUrl(currentImageUrl)) {
      try {
        await ImageService.deleteImage(currentImageUrl);
      } catch (error) {
        console.error('Erro ao deletar imagem do Supabase:', error);
      }
    }

    setPreview(null);
    setUploadedUrl(null);
    onChange?.(null, undefined); // Passar undefined para limpar a URL também
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="relative w-full">
        {label && (
          <label
            className={`
              absolute left-4
              pointer-events-none
              transition-all duration-200
              z-10
              ${isActive
                ? 'top-0 text-xs -translate-y-1/2 bg-[var(--background)] px-2'
                : 'top-4 text-sm'
              }
              ${isDragOver && !error
                ? 'text-[var(--primary)]'
                : error
                ? 'text-[var(--error)]'
                : 'text-[var(--on-background)]'
              }
            `}
            style={{
              '--primary': '#bd253c',
              '--secondary': '#970b27',
              '--background': '#ffffff',
              '--foreground': '#111827',
              '--on-background': '#6b7280',
              '--error': '#ef4444'
            } as React.CSSProperties}
          >
            {label}
          </label>
        )}

        <div
          ref={containerRef}
          className={`
            relative
            w-full
            h-[200px]
            border-2 border-dashed
            rounded-2xl
            transition-all
            cursor-pointer
            ${isDragOver 
              ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
              : 'border-[var(--on-background)] hover:border-[var(--primary)]/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-[var(--error)]' : ''}
            ${isActive && label ? 'pt-4' : ''}
          `}
          style={{
            '--primary': '#bd253c',
            '--secondary': '#970b27',
            '--background': '#ffffff',
            '--foreground': '#111827',
            '--on-background': '#6b7280',
            '--error': '#ef4444'
          } as React.CSSProperties}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          tabIndex={disabled ? -1 : 0}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
            disabled={disabled}
          />

          {(preview || currentImageUrl) ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <img
                src={preview || currentImageUrl || ''}
                alt="Preview da imagem"
                className="w-full h-full object-contain bg-gray-50"
              />
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-20"
                  aria-label="Remover imagem"
                >
                  <X size={16} />
                </button>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <LoadingSpinner size="small" />
                </div>
              )}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center p-8 text-center ${isActive && label ? 'pt-6' : ''}`}>
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <LoadingSpinner size="medium" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-[var(--primary)]/10 rounded-full">
                    <ImageIcon size={32} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                      {placeholder}
                    </p>
                    <p className="text-xs text-[var(--on-background)]">
                      PNG, JPG, GIF até {maxSize}MB
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    <Upload size={16} />
                    Selecionar Arquivo
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div 
          className="flex items-start gap-2 px-4 py-2 bg-[var(--error)]/5 border-l-2 border-[var(--error)] rounded-r-lg transition-all duration-200 animate-fade-in"
          style={{
            '--error': '#ef4444'
          } as React.CSSProperties}
        >
          <AlertCircle 
            size={16} 
            className="text-[var(--error)] flex-shrink-0 mt-0.5"
            style={{
              '--error': '#ef4444'
            } as React.CSSProperties}
          />
          <span className="text-sm text-[var(--error)] leading-relaxed">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
