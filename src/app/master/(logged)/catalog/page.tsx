'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/buttons/button';
import { Plus, Save, RefreshCw } from 'lucide-react';
import CategorySection from '@/app/components/categories/CategorySection';
import CategoryModal from '@/app/components/modals/categoryModal';
import DeleteCategoryModal from '@/app/components/modals/deleteCategoryModal';
import DeleteProductModal from '@/app/components/modals/deleteProductModal';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

// Interface local para compatibilidade com dados existentes
interface CatalogProduct {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock?: number;
  stockType?: string;
  stockLinesCount?: number;
  order: number;
}

interface Category {
  id: string;
  name: string;
  order: number;
  products: CatalogProduct[];
}

export default function CatalogPage() {
  const router = useRouter();
  
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para controlar mudanças de ordem de produtos
  const [hasProductOrderChanges, setHasProductOrderChanges] = useState(false);
  const [productOrderChangesByCategory, setProductOrderChangesByCategory] = useState<Record<string, boolean>>({});

  const handleCreateCategory = () => {
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (categoryName: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Sessão expirada');

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      } as const;

      if (editingCategoryId) {
        const res = await fetch(`/api/master/catalog/categories/${editingCategoryId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ name: categoryName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao editar categoria');
        showSuccessToast('Categoria editada com sucesso!');
      } else {
        const res = await fetch(`/api/master/catalog/categories`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: categoryName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao criar categoria');
        showSuccessToast('Categoria criada com sucesso!');
      }

      setIsModalOpen(false);
      setEditingCategoryId(null);
      setEditingCategoryName('');
      await loadCatalog();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao salvar categoria');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleEditCategory = (categoryId: string) => {
    const category = localCategories.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCategoryId(categoryId);
      setEditingCategoryName(category.name);
      setIsModalOpen(true);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = localCategories.find(cat => cat.id === categoryId);
    if (category) {
      setDeletingCategoryId(categoryId);
      setDeletingCategoryName(category.name);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategoryId) return;
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Sessão expirada');
      const res = await fetch(`/api/master/catalog/categories/${deletingCategoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir categoria');
      showSuccessToast('Categoria excluída com sucesso!');
      setIsDeleteModalOpen(false);
      setDeletingCategoryId(null);
      setDeletingCategoryName('');
      await loadCatalog();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao excluir categoria');
    }
  };

  const handleAddProduct = (categoryId: string) => {
    // Navegar para página de criação com categoryId como query param
    const url = `/master/catalog/new?categoryId=${categoryId}`;
    router.push(url);
  };

  const handleEditProduct = (productId: string) => {
    // Redirecionar para página de edição do produto
    router.push(`/master/catalog/${productId}`);
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
      showSuccessToast('Produto excluído com sucesso!');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao excluir produto');
    } finally {
      setIsDeleteProductModalOpen(false);
      setDeletingProductId(null);
      setDeletingProductName('');
    }
  };

const handleReorderProducts = (categoryId: string, reorderedProducts: CatalogProduct[]) => {
    
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
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Sessão expirada');

      // Salvar ordem das categorias
      if (hasOrderChanges) {
        const items = localCategories.map(c => ({ id: c.id, order: c.order }));
        const res = await fetch('/api/master/catalog/categories/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ items }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao salvar ordem das categorias');
        showSuccessToast('Ordem das categorias salva com sucesso!');
      }

      // Salvar ordem dos produtos por categoria alterada
      if (hasProductOrderChanges) {
        const changedCategoryIds = Object.entries(productOrderChangesByCategory)
          .filter(([, changed]) => changed)
          .map(([id]) => id);

        for (const categoryId of changedCategoryIds) {
          const category = localCategories.find(c => c.id === categoryId);
          if (!category) continue;
          const products = category.products.map(p => ({ id: p.id, order: p.order }));
          const res = await fetch('/api/master/catalog/products/reorder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ catalogCategoryId: categoryId, products }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Erro ao salvar ordem dos produtos');
        }
        showSuccessToast('Ordem dos produtos salva com sucesso!');
      }

      setHasOrderChanges(false);
      setHasProductOrderChanges(false);
      setProductOrderChangesByCategory({});
    } catch (error) {
      showErrorToast('Erro ao salvar ordem');
    }
  };

  const handleCancelOrder = () => {
    setHasOrderChanges(false);
    setHasProductOrderChanges(false);
    setProductOrderChangesByCategory({});
    showSuccessToast('Alterações canceladas');
  };

  // Carregar categorias + produtos do catálogo
  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Sessão expirada');

      const headers = { 'Authorization': `Bearer ${accessToken}` } as const;
      const res = await fetch('/api/master/catalog/categories', { headers, cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar categorias');

      const categories: Array<{ id: string; name: string; order: number }> = data.data.categories;

      // Buscar produtos por categoria em paralelo
      const results = await Promise.all(categories.map(async (cat) => {
        const r = await fetch(`/api/master/catalog/products?catalogCategoryId=${cat.id}`, { headers, cache: 'no-store' });
        const d = await r.json();
        if (!r.ok) {
          return { ...cat, products: [] as CatalogProduct[] };
        }
        interface ProductResponse {
          id: string;
          name: string;
          price: number;
          imageUrl?: string;
          order: number;
          stockType?: string;
          stockLines?: Array<{ id: string }>;
        }
        const products: CatalogProduct[] = ((d.data.products || []) as ProductResponse[]).map((p) => ({
          id: p.id,
          title: p.name,
          price: p.price,
          imageUrl: p.imageUrl || '',
          order: p.order || 0,
          stockType: p.stockType,
          stockLinesCount: p.stockLines?.length || 0,
        }));
        return { ...cat, products };
      }));

      // Ordenar por order antes de setar
      const normalized: Category[] = results
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ id: c.id, name: c.name, order: c.order, products: c.products }));

      setLocalCategories(normalized);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao carregar catálogo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exibir loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--on-background)]">Carregando categorias...</p>
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
            Catálogo
          </h1>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            onClick={() => {
              showSuccessToast('Atualizando catálogo...');
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
              products={category.products.map(p => ({
                id: p.id,
                title: p.title,
                price: p.price,
                imageUrl: p.imageUrl,
                order: p.order
              }))}
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
            Crie sua primeira categoria para começar a organizar os produtos do catálogo
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
