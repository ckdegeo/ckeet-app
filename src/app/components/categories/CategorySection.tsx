'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import ProductCard from '@/app/components/products/productCard';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import Button from '@/app/components/buttons/button';
import { Product } from '@/lib/types';

// Interface local para compatibilidade com dados existentes
interface ProductDisplay {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock?: number;
  order: number;
}
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente wrapper para ProductCard com drag and drop
function SortableProductCard({ product, onEdit, onDelete }: {
  product: ProductDisplay;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative"
    >
      {/* Handle de drag */}
      <div
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-2"
      >
        <IconOnlyButton
          icon={GripVertical}
          variant="surface"
          className=" w-8 h-8"
          aria-label="Arrastar produto"
        />
      </div>
      
      <ProductCard
        id={product.id}
        title={product.title}
        price={product.price}
        imageUrl={product.imageUrl || ''}
        onEdit={onEdit}
        onDelete={onDelete}
        className="ml-2" // Adiciona margem para não sobrepor o handle
      />
    </div>
  );
}

// Interface local para compatibilidade com dados existentes
interface ProductDisplay {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock?: number;
  order: number;
}

// Interface para a categoria
interface CategorySectionProps {
  id: string;
  name: string;
  products: ProductDisplay[];
  order: number;
  totalCategories: number;
  onEditCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddProduct: (categoryId: string) => void;
  onEditProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onReorderProducts: (categoryId: string, products: ProductDisplay[]) => void;
  onMoveCategoryUp: (categoryId: string) => void;
  onMoveCategoryDown: (categoryId: string) => void;
}

export default function CategorySection({
  id,
  name,
  products,
  order,
  totalCategories,
  onEditCategory,
  onDeleteCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onReorderProducts,
  onMoveCategoryUp,
  onMoveCategoryDown
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // Configuração dos sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Garante que o componente só renderize o drag and drop no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEditCategory = () => {
    onEditCategory(id);
  };

  const handleDeleteCategory = () => {
    onDeleteCategory(id);
  };

  const handleAddProduct = () => {
    onAddProduct(id);
  };

  // Ordena os produtos por order antes de limitar a exibição
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);
  const displayProducts = sortedProducts.slice(0, 5);
  const hasMoreProducts = products.length > 5;

  // Handler para o final do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedProducts.findIndex((product) => product.id === active.id);
      const newIndex = sortedProducts.findIndex((product) => product.id === over?.id);
      
      const reorderedProducts = arrayMove(sortedProducts, oldIndex, newIndex);
      
      // Atualiza os valores de order
      const updatedProducts = reorderedProducts.map((product, index) => ({
        ...product,
        order: index
      }));
      
      onReorderProducts(id, updatedProducts);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl overflow-hidden mb-6">
      {/* Cabeçalho da categoria */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--on-background)]">
        <div className="flex items-center gap-4">
          {/* Botões de reordenação da categoria */}
          <div className="flex gap-1">
            <IconOnlyButton
              icon={ChevronUp}
              onClick={() => onMoveCategoryUp(id)}
              variant="surface"
              className="w-6 h-6 p-1"
              disabled={order === 0}
            />
            <IconOnlyButton
              icon={ChevronDown}
              onClick={() => onMoveCategoryDown(id)}
              variant="surface"
              className="w-6 h-6 p-1"
              disabled={order === totalCategories - 1}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{name}</h2>
            <span className="text-sm text-[var(--on-background)] bg-[var(--background)] px-2 py-1 rounded-full">
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-variant)]"
          >
            <Plus size={16} />
            Adicionar Produto
          </Button>
          
          <IconOnlyButton
            icon={Edit2}
            onClick={handleEditCategory}
            variant="primary"
          />
          
          <IconOnlyButton
            icon={Trash2}
            onClick={handleDeleteCategory}
            variant="error"
          />
        </div>
      </div>
      
      {/* Conteúdo da categoria (produtos) */}
      {isExpanded && (
        <div className="p-4">
          {/* Grid de produtos */}
          {displayProducts.length > 0 ? (
            isMounted ? (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={displayProducts.map(p => p.id)} 
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayProducts.map(product => (
                      <SortableProductCard
                        key={product.id}
                        product={product}
                        onEdit={onEditProduct}
                        onDelete={onDeleteProduct}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    imageUrl={product.imageUrl || ''}
                    onEdit={onEditProduct}
                    onDelete={onDeleteProduct}
                  />
                ))}
              </div>
            )
          ) : (
            <p className="text-center py-8 text-[var(--on-background)]">
              Nenhum produto cadastrado nesta categoria.
            </p>
          )}
          
          {/* Indicador de mais produtos */}
          {hasMoreProducts && (
            <div className="mt-4 text-center">
              <p className="text-sm text-[var(--on-background)]">
                Exibindo 5 de {products.length} produtos
              </p>
              <Button
                className="mt-2 bg-transparent border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
                onClick={() => {}}
              >
                Ver todos os produtos
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
