'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit2, Trash2 } from 'lucide-react';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

// Interface para as props do componente
interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock?: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export default function ProductCard({
  id,
  title,
  price,
  imageUrl,
  stock = 0,
  onEdit,
  onDelete,
  className = "",
}: ProductCardProps) {
  // Estado para controlar se o link foi copiado
  const [copied, setCopied] = useState(false);
  
  // Estado para armazenar a URL do checkout
  const [checkoutUrl, setCheckoutUrl] = useState(`https://dominio.com.br/checkout/${id}`);  
  
  // Atualiza a URL quando o componente é montado no cliente
  useEffect(() => {
    // Gera o hash apenas uma vez na montagem do componente
    const checkoutHash = id ? `${id}-${Math.random().toString(36).substring(2, 8)}` : 'demo-product';
    
    if (typeof window !== 'undefined') {
      setCheckoutUrl(`${window.location.origin}/checkout/${checkoutHash}`);
    }
  }, [id]); // Dependência apenas do id, não do hash

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(id);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(id);
  };
  
  // Função para copiar o link do checkout
  const copyCheckoutLink = async () => {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setCopied(true);
      
      // Reset do estado após 2 segundos
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  return (
    <div className={`
      bg-[var(--background)]
      border border-[var(--on-background)]
      rounded-2xl
      overflow-hidden
      transition-all
      hover:shadow-md
      ${className}
    `}>
      {/* Imagem do produto */}
      <div className="relative w-full h-48 bg-gray-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      
      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2 line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-bold text-[var(--foreground)]">
            {formatCurrency(price)}
          </p>
          <div className="flex items-center gap-1">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
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
      </div>
      
      {/* Ações */}
      <div className="flex items-center justify-end gap-2 p-4 pt-0">
        <IconOnlyButton 
          icon={Edit2} 
          onClick={handleEdit}
          className="w-10 h-10"
          variant="surface"
          aria-label="Editar produto"
        />
        <IconOnlyButton 
          icon={Trash2} 
          onClick={handleDelete}
          className="w-10 h-10"
          variant="error"
          aria-label="Excluir produto"
        />
      </div>
    </div>
  );
}