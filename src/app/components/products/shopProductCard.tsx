'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

// Interface para as props do componente
interface ShopProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock?: number;
  onAddToCart?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
  className?: string;
}

export default function ShopProductCard({
  id,
  title,
  price,
  imageUrl,
  stock = 0,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  className = "",
}: ShopProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAddToCart = async () => {
    if (stock === 0) return;
    
    // Redirecionar para a página de detalhes do produto
    router.push(`/shop/${id}`);
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) onToggleFavorite(id);
  };

  const isOutOfStock = stock === 0;

  return (
    <div className={`
      bg-[var(--background)]
      border border-[var(--on-background)]/20
      rounded-2xl
      overflow-hidden
      transition-all
      hover:shadow-md
      hover:border-[var(--on-background)]/30
      flex flex-col
      h-[420px]
      ${className}
    `}>
      {/* Imagem do produto - Altura fixa */}
      <div className="relative w-full h-48 bg-gray-100 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        
        {/* Botão de favorito - Posição fixa */}
        <div className="absolute top-3 right-3">
          <IconOnlyButton
            icon={Heart}
            onClick={handleToggleFavorite}
            variant="surface"
            className={`w-8 h-8 ${isFavorite ? 'text-red-500' : ''}`}
          />
        </div>

        {/* Badge de estoque - Posição fixa */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-[var(--error)] text-[var(--on-error)] px-3 py-1 rounded-full text-sm font-medium">
              Esgotado
            </span>
          </div>
        )}
      </div>
      
      {/* Conteúdo - Flex para distribuir espaço */}
      <div className="p-4 flex flex-col flex-1">
        {/* Título - Altura fixa com 2 linhas */}
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-3 line-clamp-2 h-14 leading-7">
          {title}
        </h3>
        
        {/* Preço e estoque - Altura fixa */}
        <div className="flex items-center justify-between mb-4 h-6">
          <p className="text-xl font-bold text-[var(--foreground)]">
            {formatCurrency(price)}
          </p>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap truncate max-w-[90px]
              ${stock > 10 
                ? 'bg-[var(--secondary)] text-[var(--on-secondary)]' 
                : stock > 0 
                ? 'bg-[var(--primary)] text-[var(--on-primary)]' 
                : 'bg-[var(--error)] text-[var(--on-error)]'
              }
            `}>
              {stock} em estoque
            </span>
          </div>
        </div>

        {/* Botão de compra - Sempre no final, altura fixa */}
        <div className="mt-auto">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`
              w-full h-12 flex items-center justify-center gap-2 font-medium
              ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <ShoppingCart size={16} />
            <span className="truncate">
              {isOutOfStock ? 'Indisponível' : 'Comprar'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
