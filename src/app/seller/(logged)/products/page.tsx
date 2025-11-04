'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/buttons/button';
import { Plus, Save, RefreshCw } from 'lucide-react';
import CategorySection from '@/app/components/categories/CategorySection';
import CategoryModal from '@/app/components/modals/categoryModal';
import DeleteCategoryModal from '@/app/components/modals/deleteCategoryModal';
import DeleteProductModal from '@/app/components/modals/deleteProductModal';
import { useCategories, Category } from '@/lib/hooks/useCategories';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
import { invalidateProductCategoryCaches } from '@/lib/utils/cacheInvalidation';
import LoadingSpinner from '@/app/components/ui/loadingSpinner';

// Interface local para compatibilidade com dados existentes
interface ProductDisplay {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock?: number;
  stockType?: string;
  stockLinesCount?: number;
  order: number;
}

export default function Products() {
  const router = useRouter();
  // Hook para gerenciar categorias
  const { 
    categories, 
    isLoading, 
    createCategory, 
    editCategory, 
    deleteCategory,
    saveCategoriesOrder,
    fetchCategories
  } = useCategories();

  // Estado para controlar modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');
  
  // Estado para modal de exclusão de categoria
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingCategoryName, setDeletingCategoryName] = useState<string>('');
  
  // Estado para modal de exclusão de produto
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingProductName, setDeletingProductName] = useState<string>('');

  // Estado local para gerenciar ordem temporária
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  
  // Estado para controlar mudanças de ordem de produtos
  const [hasProductOrderChanges, setHasProductOrderChanges] = useState(false);
  const [productOrderChangesByCategory, setProductOrderChangesByCategory] = useState<Record<string, boolean>>({});

  // Atualizar categorias locais quando as categorias do servidor mudarem
  useEffect(() => {
    setLocalCategories(categories);
    setHasOrderChanges(false);
    setHasProductOrderChanges(false);
    setProductOrderChangesByCategory({});
  }, [categories]);

  // Refetch automático ao montar a página (apenas uma vez)
  useEffect(() => {
    // Forçar refresh na montagem inicial para garantir dados atualizados
    fetchCategories(true);
  }, []);

  const handleCreateCategory = () => {
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (categoryName: string) => {
    if (editingCategoryId) {
      // Editar categoria existente
      await editCategory(editingCategoryId, categoryName);
      setEditingCategoryId(null);
      setEditingCategoryName('');
    } else {
      // Criar nova categoria
      await createCategory(categoryName);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleEditCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCategoryId(categoryId);
      setEditingCategoryName(category.name);
      setIsModalOpen(true);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setDeletingCategoryId(categoryId);
      setDeletingCategoryName(category.name);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingCategoryId) {
      await deleteCategory(deletingCategoryId);
      setIsDeleteModalOpen(false);
      setDeletingCategoryId(null);
      setDeletingCategoryName('');
    }
  };

  const handleAddProduct = (categoryId: string) => {
    // Navegar para página de criação com categoryId como query param
    const url = `/seller/products/new?categoryId=${categoryId}`;
    router.push(url);
  };

  const handleEditProduct = (productId: string) => {
    // Redirecionar para página de edição do produto
    router.push(`/seller/products/${productId}`);
  };

  const handleDeleteProduct = (productId: string) => {
    // Buscar informações do produto para exibir no modal
    const product = localCategories
      .flatMap(cat => cat.products)
      .find(prod => prod.id === productId);
    
    if (product) {
      setDeletingProductId(productId);
      setDeletingProductName(product.title);
      setIsDeleteProductModalOpen(true);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deletingProductId) return;

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        showErrorToast('Token de acesso não encontrado');
        return;
      }

      const response = await fetch('/api/seller/products/soft-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id: deletingProductId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir produto');
      }

      showSuccessToast('Produto excluído com sucesso!');
      
      // Forçar refresh das categorias após exclusão
      await fetchCategories(true);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao excluir produto');
    } finally {
      setIsDeleteProductModalOpen(false);
      setDeletingProductId(null);
      setDeletingProductName('');
    }
  };

  const handleReorderProducts = (categoryId: string, reorderedProducts: ProductDisplay[]) => {
    
    // Atualizar a categoria com os produtos reordenados
    setLocalCategories(prevCategories => 
      prevCategories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, products: reorderedProducts }
          : cat
      )
    );
    
    // Marcar que há mudanças de ordem para esta categoria
    setProductOrderChangesByCategory(prev => ({
      ...prev,
      [categoryId]: true
    }));
    setHasProductOrderChanges(true);
  };

  const handleMoveCategoryUp = (categoryId: string) => {
    // Ordenar categorias por order para verificar posição real
    const sortedCategories = [...localCategories].sort((a, b) => a.order - b.order);
    const currentIndex = sortedCategories.findIndex(cat => cat.id === categoryId);
    
    // Verificar se já está no topo
    if (currentIndex <= 0) {
      return; // Não faz nada se já está no topo ou não encontrou
    }
    
    // Trocar posições localmente
    const newCategories = [...sortedCategories];
    const temp = newCategories[currentIndex].order;
    newCategories[currentIndex].order = newCategories[currentIndex - 1].order;
    newCategories[currentIndex - 1].order = temp;
    
    setLocalCategories(newCategories);
    setHasOrderChanges(true);
  };

  const handleMoveCategoryDown = (categoryId: string) => {
    // Ordenar categorias por order para verificar posição real
    const sortedCategories = [...localCategories].sort((a, b) => a.order - b.order);
    const currentIndex = sortedCategories.findIndex(cat => cat.id === categoryId);
    
    // Verificar se já está no final
    if (currentIndex === -1 || currentIndex >= sortedCategories.length - 1) {
      return; // Não faz nada se já está no final ou não encontrou
    }
    
    // Trocar posições localmente
    const newCategories = [...sortedCategories];
    const temp = newCategories[currentIndex].order;
    newCategories[currentIndex].order = newCategories[currentIndex + 1].order;
    newCategories[currentIndex + 1].order = temp;
    
    setLocalCategories(newCategories);
    setHasOrderChanges(true);
  };

  const handleSaveOrder = async () => {
    try {
      
      // Salvar ordem das categorias se houver mudanças
      if (hasOrderChanges) {
        await saveCategoriesOrder(localCategories);
      }
      
      // Salvar ordem dos produtos se houver mudanças
      if (hasProductOrderChanges) {
        await saveProductsOrder();
      }
      
      setHasOrderChanges(false);
      setHasProductOrderChanges(false);
      setProductOrderChangesByCategory({});
      
      // Garantir que o toast apareça
      setTimeout(() => {
        if (hasOrderChanges && hasProductOrderChanges) {
          showSuccessToast('Ordem salva com sucesso!');
        } else if (hasOrderChanges) {
          showSuccessToast('Ordem das categorias salva com sucesso!');
        } else if (hasProductOrderChanges) {
          showSuccessToast('Ordem dos produtos salva com sucesso!');
        }
      }, 100);
    } catch (error) {
      showErrorToast('Erro ao salvar ordem');
    }
  };
  
  const saveProductsOrder = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Token de acesso não encontrado');
    }
    
    // Coletar todos os produtos com mudanças de ordem
    const productsToUpdate: { id: string; order: number }[] = [];
    
    Object.keys(productOrderChangesByCategory).forEach(categoryId => {
      if (productOrderChangesByCategory[categoryId]) {
        const category = localCategories.find(cat => cat.id === categoryId);
        if (category) {
          category.products.forEach(product => {
            productsToUpdate.push({
              id: product.id,
              order: product.order
            });
          });
        }
      }
    });
    
    if (productsToUpdate.length === 0) {
      return;
    }
    
    const response = await fetch('/api/seller/products/batch-reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ products: productsToUpdate })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao salvar ordem dos produtos');
    }

    // Invalidar cache relacionado a produtos/categorias após reordenação
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId || payload.sub;
        if (userId) {
          invalidateProductCategoryCaches(userId);
        }
      }
    } catch (error) {
    }
  };

  const handleCancelOrder = () => {
    setLocalCategories(categories);
    setHasOrderChanges(false);
    setHasProductOrderChanges(false);
    setProductOrderChangesByCategory({});
    showSuccessToast('Alterações canceladas');
  };

  // Exibir loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com título e botões de ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Produtos
          </h1>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            onClick={() => {
              fetchCategories(true);
              showSuccessToast('Atualizando produtos...');
            }}
            variant="secondary"
            className="flex items-center gap-2 px-4 py-2 min-h-[44px] cursor-pointer"
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Atualizar
          </Button>
          {(hasOrderChanges || hasProductOrderChanges) && (
            <>
              <Button 
                onClick={handleCancelOrder}
                variant="secondary"
                className="flex items-center gap-2 px-4 py-2 min-h-[44px] cursor-pointer"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveOrder}
                variant="primary"
                className="flex items-center gap-2 px-4 py-2 min-h-[44px] cursor-pointer bg-[var(--primary)] hover:bg-[var(--primary-variant)]"
              >
                <Save size={18} />
                Salvar
              </Button>
            </>
          )}
          <Button 
            onClick={handleCreateCategory}
            className="flex items-center gap-2 px-4 py-2 min-h-[44px] cursor-pointer"
          >
            <Plus size={18} />
            Criar Categoria
          </Button>
        </div>
      </div>

      {/* Lista de categorias */}
      {localCategories.length > 0 ? (
        <div className="space-y-6">
          {localCategories
            .sort((a, b) => a.order - b.order)
            .map(category => (
            <CategorySection
              key={category.id}
              id={category.id}
              name={category.name}
              products={category.products}
              order={category.order}
              totalCategories={localCategories.length}
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
        <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            Nenhuma categoria criada
          </h3>
          <p className="text-[var(--on-background)] mb-6">
            Crie sua primeira categoria para começar a organizar seus produtos
          </p>
        </div>
      )}

      {/* Modal de criação/edição de categoria */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        editMode={!!editingCategoryId}
        initialName={editingCategoryName}
      />

      {/* Modal de exclusão de categoria */}
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        categoryName={deletingCategoryName}
      />

      {/* Modal de exclusão de produto */}
      <DeleteProductModal
        isOpen={isDeleteProductModalOpen}
        onClose={() => setIsDeleteProductModalOpen(false)}
        onConfirm={handleConfirmDeleteProduct}
        productName={deletingProductName}
      />
    </div>
  );
}
