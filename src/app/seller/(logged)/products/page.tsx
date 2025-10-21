'use client';

import { useState } from 'react';
import Button from '@/app/components/buttons/button';
import { Plus } from 'lucide-react';
import CategorySection from '@/app/components/categories/CategorySection';
import CategoryModal from '@/app/components/modals/categoryModal';
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

// Dados de exemplo
const sampleCategories = [
  {
    id: '1',
    name: 'Eletrônicos',
    order: 0,
    products: [
      {
        id: '101',
        title: 'Smartphone XYZ',
        price: 1299.90,
        imageUrl: '/product1.gif',
        stock: 15,
        order: 0
      },
      {
        id: '102',
        title: 'Fone de Ouvido Bluetooth',
        price: 199.90,
        imageUrl: '/product2.webp',
        stock: 5,
        order: 1
      },
      {
        id: '103',
        title: 'Smartwatch',
        price: 499.90,
        imageUrl: '/product1.gif',
        stock: 0,
        order: 2
      }
    ]
  },
  {
    id: '2',
    name: 'Roupas',
    order: 1,
    products: [
      {
        id: '201',
        title: 'Camiseta Básica',
        price: 49.90,
        imageUrl: '/product2.webp',
        stock: 25,
        order: 0
      },
      {
        id: '202',
        title: 'Calça Jeans',
        price: 129.90,
        imageUrl: '/product1.gif',
        stock: 8,
        order: 1
      }
    ]
  }
];

export default function Products() {
  // Estado para controlar a abertura de um modal (quando implementado)
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado para armazenar as categorias
  const [categories, setCategories] = useState(sampleCategories);

  const handleCreateCategory = () => {
    setIsModalOpen(true);
  };

  const handleSaveCategory = (categoryName: string) => {
    // Criar nova categoria
    const newCategory = {
      id: Date.now().toString(),
      name: categoryName,
      order: categories.length,
      products: []
    };
    
    setCategories([...categories, newCategory]);
    console.log('Nova categoria criada:', categoryName);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditCategory = (categoryId: string) => {
    console.log('Editar categoria:', categoryId);
    // Implementar lógica para editar categoria
  };

  const handleDeleteCategory = (categoryId: string) => {
    console.log('Excluir categoria:', categoryId);
    // Implementar lógica para excluir categoria
    setCategories(categories.filter(category => category.id !== categoryId));
  };

  const handleAddProduct = (categoryId: string) => {
    console.log('Adicionar produto à categoria:', categoryId);
    // Implementar lógica para adicionar produto
  };

  const handleEditProduct = (productId: string) => {
    console.log('Editar produto:', productId);
    // Implementar lógica para editar produto
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Excluir produto:', productId);
    // Implementar lógica para excluir produto
    setCategories(categories.map(category => ({
      ...category,
      products: category.products.filter(product => product.id !== productId)
    })));
  };

  const handleReorderProducts = (categoryId: string, reorderedProducts: ProductDisplay[]) => {
    console.log('Reordenar produtos na categoria:', categoryId, reorderedProducts);
    // TODO: Implementar lógica de reordenação quando necessário
  };

  const handleMoveCategoryUp = (categoryId: string) => {
    console.log('Mover categoria para cima:', categoryId);
    // TODO: Implementar lógica de movimentação quando necessário
  };

  const handleMoveCategoryDown = (categoryId: string) => {
    console.log('Mover categoria para baixo:', categoryId);
    // TODO: Implementar lógica de movimentação quando necessário
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com título e botão de ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Produtos
        </h1>
        
        <Button 
          onClick={handleCreateCategory}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Criar Categoria
        </Button>
      </div>

      {/* Lista de categorias */}
      {categories.length > 0 ? (
        <div className="space-y-6">
          {categories
            .sort((a, b) => a.order - b.order)
            .map(category => (
            <CategorySection
              key={category.id}
              id={category.id}
              name={category.name}
              products={category.products}
              order={category.order}
              totalCategories={categories.length}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onReorderProducts={handleReorderProducts}
              onMoveCategoryUp={handleMoveCategoryUp}
              onMoveCategoryDown={handleMoveCategoryDown}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-lg p-6">
          <p className="text-[var(--on-background)] text-center py-12">
            Você ainda não tem categorias cadastradas. 
            Crie uma categoria para começar a adicionar produtos.
          </p>
        </div>
      )}

      {/* Modal de criação de categoria */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
      />
    </div>
  );
}
