'use client';

import { useState } from 'react';
import CatalogProductCard from '@/app/components/cards/catalogProductCard';
import Button from '@/app/components/buttons/button';
import { ArrowRight } from 'lucide-react';

// Interface para produtos do catálogo
interface CatalogProductDisplay {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  order: number;
}

// Interface para a categoria do catálogo
interface CatalogCategorySectionProps {
  id: string;
  name: string;
  products: CatalogProductDisplay[];
  onImport?: (sourceProductId: string) => void;
  disabledImports?: string[]; // IDs de produtos que estão sendo importados
  onImportSection?: (categoryId: string) => void; // ação para importar a partir da seção
}

export default function CatalogCategorySection({
  id,
  name,
  products,
  onImport,
  disabledImports = [],
  onImportSection
}: CatalogCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Ordena os produtos por order antes de limitar a exibição
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);
  const displayProducts = sortedProducts.slice(0, 5);
  const hasMoreProducts = products.length > 5;

  return (
    <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl overflow-hidden mb-6">
      {/* Cabeçalho da categoria */}
      <div className="p-4 border-b border-[var(--on-background)]">
        {/* Layout desktop */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">{name}</h2>
              <span className="text-sm text-[var(--on-background)] bg-[var(--background)] px-2 py-1 rounded-full">
                {products.length} {products.length === 1 ? 'produto' : 'produtos'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => onImportSection && onImportSection(id)}>
              Importar todos
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* Layout mobile */}
        <div className="sm:hidden space-y-3">
          {/* Linha 1: Título e contador */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{name}</h2>
            <span className="text-sm text-[var(--on-background)] bg-[var(--background)] px-2 py-1 rounded-full">
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </span>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onImportSection && onImportSection(id)} className="text-sm px-3 py-2">
              Importar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Conteúdo da categoria (produtos) */}
      {isExpanded && (
        <div className="p-4">
          {/* Grid de produtos */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {displayProducts.map(product => (
                <CatalogProductCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl || ''}
                  onImport={onImport}
                  disabled={disabledImports.includes(product.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-[var(--on-background)]">
              Nenhum produto disponível nesta categoria.
            </p>
          )}
          
          {/* Indicador de mais produtos */}
          {hasMoreProducts && (
            <div className="mt-4 text-center">
              <p className="text-sm text-[var(--on-background)]">
                Exibindo 5 de {products.length} produtos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
