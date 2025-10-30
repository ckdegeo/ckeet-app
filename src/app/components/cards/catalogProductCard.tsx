'use client';

import Image from 'next/image';
import Button from '@/app/components/buttons/button';
import { ArrowRight } from 'lucide-react';

interface CatalogProductCardProps {
  id: string; // sourceProductId
  title: string;
  price: number;
  imageUrl: string;
  className?: string;
  disabled?: boolean;
  onImport?: (sourceProductId: string) => void;
}

export default function CatalogProductCard({
  id,
  title,
  price,
  imageUrl,
  className = '',
  disabled = false,
  onImport,
}: CatalogProductCardProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className={`
      bg-[var(--background)]
      border border-[var(--on-background)]
      rounded-2xl
      overflow-hidden
      transition-all
      hover:shadow-md
      min-w-0
      w-full
      ${className}
    `}>
      {/* Imagem */}
      <div className="relative w-full h-40 sm:h-48 bg-gray-100 flex items-center justify-center">
        {imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/')) ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="text-gray-400 text-center p-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2 line-clamp-2">{title}</h3>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-bold text-[var(--foreground)]">{formatCurrency(price)}</p>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--on-primary)]">
            Catálogo
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-2 p-4 pt-0">
        <Button
          onClick={() => !disabled && onImport && onImport(id)}
          className="px-4"
          disabled={disabled}
        >
          Importar
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}


