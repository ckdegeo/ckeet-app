'use client';

import { useState, useEffect, useCallback } from 'react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

interface ProductDisplay {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock?: number;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  products: ProductDisplay[];
}

export { type ProductDisplay };

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar categorias
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/seller/categories/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar categorias');
      }

      setCategories(data.categories || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar categoria
  const createCategory = useCallback(async (name: string) => {
    try {
      // Verificar se já existe uma categoria com o mesmo nome (case-insensitive)
      const categoryExists = categories.some(
        cat => cat.name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (categoryExists) {
        showErrorToast('Categoria já criada');
        throw new Error('Categoria já criada');
      }

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/seller/categories/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Verificar se é erro de duplicação
        if (data.error?.includes('já existe')) {
          showErrorToast('Categoria já criada');
        } else {
          showErrorToast(data.error || 'Erro ao criar categoria');
        }
        throw new Error(data.error || 'Erro ao criar categoria');
      }

      showSuccessToast(data.message || 'Categoria criada com sucesso!');
      
      // Recarregar categorias
      await fetchCategories();
      
      return data.category;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      // Só mostrar toast se não for erro de duplicação (já mostrado acima)
      if (!errorMessage.includes('já criada') && !errorMessage.includes('já existe')) {
        showErrorToast(errorMessage);
      }
      throw err;
    }
  }, [categories, fetchCategories]);

  // Editar categoria
  const editCategory = useCallback(async (categoryId: string, name: string) => {
    try {
      // Verificar se já existe outra categoria com o mesmo nome (excluindo a atual)
      const categoryExists = categories.some(
        cat => cat.id !== categoryId && 
               cat.name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (categoryExists) {
        showErrorToast('Categoria já criada');
        throw new Error('Categoria já criada');
      }

      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/seller/categories/edit', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Verificar se é erro de duplicação
        if (data.error?.includes('já existe')) {
          showErrorToast('Categoria já criada');
        } else {
          showErrorToast(data.error || 'Erro ao editar categoria');
        }
        throw new Error(data.error || 'Erro ao editar categoria');
      }

      showSuccessToast(data.message || 'Categoria atualizada com sucesso!');
      
      // Recarregar categorias
      await fetchCategories();
      
      return data.category;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      // Só mostrar toast se não for erro de duplicação (já mostrado acima)
      if (!errorMessage.includes('já criada') && !errorMessage.includes('já existe')) {
        showErrorToast(errorMessage);
      }
      throw err;
    }
  }, [categories, fetchCategories]);

  // Excluir categoria
  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/seller/categories/soft-delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir categoria');
      }

      showSuccessToast(data.message || 'Categoria removida com sucesso!');
      
      // Recarregar categorias
      await fetchCategories();
      
      return data.category;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      showErrorToast(errorMessage);
      throw err;
    }
  }, [fetchCategories]);

  // Salvar ordem de categorias em lote
  const saveCategoriesOrder = useCallback(async (categoriesToSave: Category[]) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/seller/categories/batch-reorder', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          categories: categoriesToSave.map(cat => ({ id: cat.id, order: cat.order }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar ordem das categorias');
      }

      // Recarregar categorias
      await fetchCategories();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      showErrorToast(errorMessage);
      throw err;
    }
  }, [fetchCategories]);

  // Carregar categorias ao montar o componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    editCategory,
    deleteCategory,
    saveCategoriesOrder,
  };
}

