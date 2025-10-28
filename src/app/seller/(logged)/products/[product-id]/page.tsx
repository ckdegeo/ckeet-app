'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Box, Hash, Key, Edit, Trash2, Upload, Download, Plus } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
import { invalidateProductCategoryCaches } from '@/lib/utils/cacheInvalidation';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import Button from '@/app/components/buttons/button';
import Input from '@/app/components/inputs/input';
import Description from '@/app/components/inputs/description';
import ValueInput from '@/app/components/inputs/valueInput';
import Tabs from '@/app/components/tabs/tabs';
import Table from '@/app/components/tables/table';
import ImageUpload from '@/app/components/images/imageUpload';
import EditStockLineModal from '@/app/components/modals/editStockLineModal';
import DeleteStockLineModal from '@/app/components/modals/deleteStockLineModal';
import EditDeliverableModal from '@/app/components/modals/editDeliverableModal';
import DeleteDeliverableModal from '@/app/components/modals/deleteDeliverableModal';
import { ProductFormData, StockType, StockLineFormData, DeliverableFormData } from '@/lib/types';

// Dados do produto e configurações

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params['product-id'];
  const isNewProduct = productId === 'new';
  const categoryId = searchParams.get('categoryId');

  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    videoUrl: '',
    image1: null,
    image2: null,
    image3: null,
    stockType: StockType.LINE,
    fixedContent: '',
    keyAuthDays: 0,
    keyAuthPublicKey: '',
    keyAuthSellerKey: ''
  });

  // Carregar dados do produto se estiver editando
  useEffect(() => {
    if (!isNewProduct && productId) {
      const loadProductData = async () => {
        try {
          const accessToken = localStorage.getItem('access_token');
          if (!accessToken) {
            showErrorToast('Token de acesso não encontrado');
            return;
          }

          const response = await fetch(`/api/seller/products/list?productId=${productId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (!response.ok) {
            throw new Error('Erro ao carregar produto');
          }

          const data = await response.json();
          const product = data.products[0];

          if (product) {
            setProductData({
              name: product.name,
              description: product.description || '',
              price: product.price,
              videoUrl: product.videoUrl || '',
              image1: product.imageUrl && product.imageUrl !== 'uploaded-image-url' ? { url: product.imageUrl } : null,
              image2: product.image2Url && product.image2Url !== 'uploaded-image-url' ? { url: product.image2Url } : null,
              image3: product.image3Url && product.image3Url !== 'uploaded-image-url' ? { url: product.image3Url } : null,
              image1Url: product.imageUrl && product.imageUrl !== 'uploaded-image-url' ? product.imageUrl : undefined,
              image2Url: product.image2Url && product.image2Url !== 'uploaded-image-url' ? product.image2Url : undefined,
              image3Url: product.image3Url && product.image3Url !== 'uploaded-image-url' ? product.image3Url : undefined,
              stockType: product.stockType,
              fixedContent: product.fixedContent || '',
              keyAuthDays: product.keyAuthDays || 0,
              keyAuthPublicKey: product.keyAuthPublicKey || '',
              keyAuthSellerKey: product.keyAuthSellerKey || ''
            });
            
            // Definir a tab ativa baseada no stockType do produto em edição
            setActiveStockTab(stockTypeToTabId(product.stockType));

            // Carregar linhas de estoque
            if (product.stockLines && product.stockLines.length > 0) {
              setStockLines(product.stockLines.map((line: { id: string; content: string }, index: number) => ({
                id: line.id,
                line: index + 1,
                content: line.content
              })));
            }

            // Carregar entregáveis
            if (product.deliverables && product.deliverables.length > 0) {
              setDeliverableLinks(product.deliverables.map((deliverable: { id: string; name: string; url: string }) => ({
                id: deliverable.id,
                name: deliverable.name,
                url: deliverable.url
              })));
            }

            // Buscar nome da categoria e salvar categoryId
            if (product.categoryId) {
              setLoadedCategoryId(product.categoryId);
              // Salvar no sessionStorage para persistir entre recarregamentos
              sessionStorage.setItem(`product_${productId}_categoryId`, product.categoryId);
              
              const categoriesResponse = await fetch('/api/seller/categories/list', {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              });

              if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                const category = categoriesData.categories.find((cat: { id: string; name: string }) => cat.id === product.categoryId);
                if (category) {
                  setCategoryName(category.name);
                }
              }
            }
          }
        } catch (error) {
          console.error('Erro ao carregar produto:', error);
          showErrorToast('Erro ao carregar dados do produto');
        }
      };

      loadProductData();
    }
  }, [isNewProduct, productId]);

  // Buscar nome da categoria (apenas para novos produtos)
  useEffect(() => {
    if (categoryId && isNewProduct) {
      const fetchCategoryName = async () => {
        try {
          const accessToken = localStorage.getItem('access_token');

          if (!accessToken) {
            return;
          }

          const response = await fetch('/api/seller/categories/list', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const category = data.categories.find((cat: { id: string; name: string }) => cat.id === categoryId);
            if (category) {
              setCategoryName(category.name);
            }
          }
        } catch (error) {
          console.error('Erro ao buscar categoria:', error);
        }
      };

      fetchCategoryName();
    }
  }, [categoryId, isNewProduct]);

  const [imagePreviews, setImagePreviews] = useState({
    image1: '',
    image2: '',
    image3: ''
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeStockTab, setActiveStockTab] = useState('por_linha');
  const [categoryName, setCategoryName] = useState<string>('');
  const [loadedCategoryId, setLoadedCategoryId] = useState<string>(() => {
    // Tentar carregar do sessionStorage primeiro
    if (typeof window !== 'undefined' && !isNewProduct && productId) {
      const cached = sessionStorage.getItem(`product_${productId}_categoryId`);
      if (cached) return cached;
    }
    return '';
  });
  
  // Mapear stockType para ID da tab
  const stockTypeToTabId = (stockType: StockType): string => {
    switch (stockType) {
      case StockType.LINE:
        return 'por_linha';
      case StockType.FIXED:
        return 'fixo';
      case StockType.KEYAUTH:
        return 'keyauth';
      default:
        return 'por_linha';
    }
  };
  
  // Estados para estoque por linha
  const [stockLines, setStockLines] = useState<Array<{id: string; line: number; content: string}>>([]);
  const [newStockContent, setNewStockContent] = useState('');
  
  // Estados para modais de estoque
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStockLine, setSelectedStockLine] = useState<{id: string; line: number; content: string} | null>(null);
  
  // Estados para entregáveis
  const [deliverableLinks, setDeliverableLinks] = useState<Array<{id: string; name: string; url: string}>>([]);
  const [newDeliverable, setNewDeliverable] = useState<DeliverableFormData>({
    name: '',
    url: ''
  });
  
  // Estados para modais de entregáveis
  const [editDeliverableModalOpen, setEditDeliverableModalOpen] = useState(false);
  const [deleteDeliverableModalOpen, setDeleteDeliverableModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<{id: string; name: string; url: string} | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProductData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePriceChange = (value: number) => {
    setProductData(prev => ({
      ...prev,
      price: value
    }));
    
    if (errors.price) {
      setErrors(prev => ({
        ...prev,
        price: undefined
      }));
    }
  };

  const handleImageChange = (imageKey: 'image1' | 'image2' | 'image3') => (file: File | null, url?: string) => {
    const urlKey = `${imageKey}Url` as 'image1Url' | 'image2Url' | 'image3Url';
    
    // Se houver URL (imagem foi upada), armazenar
    if (url) {
      setProductData(prev => ({
        ...prev,
        [imageKey]: { url }, // Definir como objeto com URL para exibição
        [urlKey]: url // Armazenar URL para backend
      }));
    } else {
      // Se não há URL, definir como null e remover a URL também
      setProductData(prev => ({
        ...prev,
        [imageKey]: null,
        [urlKey]: undefined
      }));
    }
    
    // Limpar erro do campo quando o usuário fizer upload
    if (errors[imageKey]) {
      setErrors(prev => ({
        ...prev,
        [imageKey]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const errorMessages: string[] = [];

    // Validação de campos obrigatórios básicos
    if (!productData.name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
      errorMessages.push('❌ Nome do produto');
    }

    if (!productData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
      errorMessages.push('❌ Descrição do produto');
    }

    if (productData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
      errorMessages.push('❌ Preço válido (maior que R$ 0,00)');
    }

    // Verificar se há pelo menos uma imagem (URL ou objeto com URL)
    const hasImage = productData.image1Url || 
                     (productData.image1 && typeof productData.image1 === 'object' && 'url' in productData.image1);
    
    if (!hasImage) {
      newErrors.image1 = 'Pelo menos uma imagem é obrigatória';
      errorMessages.push('❌ Pelo menos 1 imagem do produto');
    }

    // Validações específicas por tipo de estoque
    if (productData.stockType === StockType.FIXED) {
      if (!productData.fixedContent?.trim()) {
        newErrors.fixedContent = 'Conteúdo fixo é obrigatório';
        errorMessages.push('❌ Conteúdo fixo (aba Estoque)');
      }
    }

    if (productData.stockType === StockType.KEYAUTH) {
      if (!productData.keyAuthDays || productData.keyAuthDays <= 0) {
        newErrors.keyAuthDays = 'Número de dias é obrigatório';
        errorMessages.push('❌ Número de dias (aba Estoque)');
      }
      if (!productData.keyAuthPublicKey?.trim()) {
        newErrors.keyAuthPublicKey = 'Chave pública é obrigatória';
        errorMessages.push('❌ Chave pública (aba Estoque)');
      }
      if (!productData.keyAuthSellerKey?.trim()) {
        newErrors.keyAuthSellerKey = 'Seller key é obrigatória';
        errorMessages.push('❌ Seller key (aba Estoque)');
      }
    }

    if (productData.stockType === StockType.LINE) {
      if (stockLines.length === 0) {
        if (newStockContent.trim()) {
          newErrors.stockLines = 'Você digitou o conteúdo mas não clicou em "Adicionar"';
          errorMessages.push('❌ Clique no botão "+ Adicionar" para adicionar a linha de estoque');
        } else {
          newErrors.stockLines = 'Adicione pelo menos uma linha de estoque';
          errorMessages.push('❌ Pelo menos 1 linha de estoque (aba Estoque > Por Linha)');
        }
      }
    }

    setErrors(newErrors);
    
    // Se houver erros, mostrar lista completa de forma clara
    if (errorMessages.length > 0) {
      // Toast principal com contagem
      showErrorToast(
        `Preencha os campos obrigatórios (${errorMessages.length} ${errorMessages.length === 1 ? 'pendente' : 'pendentes'})`
      );
      
      // Toast detalhado com lista
      setTimeout(() => {
        showErrorToast(
          `Campos pendentes: ${errorMessages.join(', ')}`
        );
      }, 300);
      
      // Scroll suave para o topo para ver o alerta de erros
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // SOLUÇÃO SIMPLES: Sempre buscar categoryId do banco para produtos em edição
    let currentCategoryId = categoryId; // Para novos produtos
    
    // Se for edição, buscar categoryId do banco SEMPRE
    if (!isNewProduct) {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`/api/seller/products/list?productId=${productId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const product = data.products[0];
          
          if (product?.categoryId) {
            currentCategoryId = product.categoryId;
          } else {
            showErrorToast('Produto não tem categoria associada');
            return;
          }
        } else {
          showErrorToast('Erro ao carregar dados do produto');
          return;
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        showErrorToast('Erro ao carregar dados do produto');
        return;
      }
    }
    
    // Verificar se temos categoryId
    if (!currentCategoryId) {
      showErrorToast('Categoria não selecionada');
      return;
    }

    setIsSaving(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        showErrorToast('Token de acesso não encontrado. Por favor, faça login novamente.');
        throw new Error('Token de acesso não encontrado');
      }

      // Determinar a URL da API (criar ou editar)
      const apiUrl = isNewProduct ? '/api/seller/products/create' : '/api/seller/products/edit';
      const method = isNewProduct ? 'POST' : 'PUT';

      const requestBody: { [key: string]: unknown } = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.image1Url || null,
        image2Url: productData.image2Url || null,
        image3Url: productData.image3Url || null,
        videoUrl: productData.videoUrl,
        stockType: productData.stockType,
        fixedContent: productData.fixedContent,
        keyAuthDays: productData.keyAuthDays,
        keyAuthPublicKey: productData.keyAuthPublicKey,
        keyAuthSellerKey: productData.keyAuthSellerKey,
        stockLines: stockLines.map(line => ({ content: line.content })),
        deliverables: deliverableLinks.map(link => ({ name: link.name, url: link.url }))
      };

      // Adicionar categoryId para ambos os casos
      requestBody.categoryId = currentCategoryId;
      
      if (!isNewProduct) {
        requestBody.id = productId;
      }

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar produto');
      }

      await response.json();
      
      // Mostrar toast de sucesso
      showSuccessToast(isNewProduct ? 'Produto criado com sucesso!' : 'Produto atualizado com sucesso!');
      
      // Invalidar cache relacionado a produtos/categorias
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
        console.error('Erro ao obter userId para invalidação de cache:', error);
      }
      
      // Redirecionar para lista de produtos no ambiente logado após um pequeno delay
      setTimeout(() => {
        router.push('/seller/products');
      }, 500);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao salvar produto');
    } finally {
      setIsSaving(false);
    }
  };

  // Funções para estoque por linha
  const handleAddStockLine = async () => {
    if (!newStockContent.trim()) return;
    
    // Se estiver editando um produto existente, salvar no banco imediatamente
    if (!isNewProduct && productId) {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          showErrorToast('Token de acesso não encontrado');
          return;
        }

        const response = await fetch('/api/seller/stock-lines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            productId: productId,
            content: newStockContent.trim()
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao adicionar linha de estoque');
        }

        const data = await response.json();
        
        // Adicionar a linha retornada pelo backend
        const newLine = {
          id: data.stockLine.id,
          line: stockLines.length + 1,
          content: data.stockLine.content
        };
        
        setStockLines(prev => [...prev, newLine]);
        setNewStockContent('');
        showSuccessToast('Linha de estoque adicionada com sucesso');
      } catch (error) {
        console.error('Erro ao adicionar linha de estoque:', error);
        showErrorToast(error instanceof Error ? error.message : 'Erro ao adicionar linha de estoque');
        return;
      }
    } else {
      // Se for produto novo, apenas adicionar localmente
      const newLine = {
        id: Date.now().toString(),
        line: stockLines.length + 1,
        content: newStockContent.trim()
      };
      
      setStockLines(prev => [...prev, newLine]);
      setNewStockContent('');
    }
    
    // Limpar erro de stockLines quando adicionar uma linha
    if (errors.stockLines) {
      setErrors(prev => ({
        ...prev,
        stockLines: undefined
      }));
    }
  };

  const handleEditStockLine = (line: {id: string; line: number; content: string}) => {
    setSelectedStockLine(line);
    setEditModalOpen(true);
  };

  const handleConfirmEditStockLine = async (content: string) => {
    if (!selectedStockLine) return;

    // Se estiver editando um produto existente, salvar no banco
    if (!isNewProduct && productId) {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          showErrorToast('Token de acesso não encontrado');
          return;
        }

        const response = await fetch('/api/seller/stock-lines', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            id: selectedStockLine.id,
            content: content
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao editar linha de estoque');
        }

        // Atualizar no estado local
        setStockLines(prev => prev.map(l => 
          l.id === selectedStockLine.id ? { ...l, content } : l
        ));
        showSuccessToast('Linha de estoque atualizada com sucesso');
      } catch (error) {
        console.error('Erro ao editar linha de estoque:', error);
        showErrorToast(error instanceof Error ? error.message : 'Erro ao editar linha de estoque');
        throw error;
      }
    } else {
      // Se for produto novo, apenas atualizar localmente
      setStockLines(prev => prev.map(l => 
        l.id === selectedStockLine.id ? { ...l, content } : l
      ));
      showSuccessToast('Linha de estoque atualizada com sucesso');
    }
  };

  const handleDeleteStockLine = (line: {id: string; line: number; content: string}) => {
    setSelectedStockLine(line);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteStockLine = async () => {
    if (!selectedStockLine) return;

    // Se estiver editando um produto existente, deletar no banco
    if (!isNewProduct && productId) {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          showErrorToast('Token de acesso não encontrado');
          return;
        }

        const response = await fetch(`/api/seller/stock-lines?id=${selectedStockLine.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Erro ao excluir linha de estoque');
        }

        // Remover do estado local
        setStockLines(prev => {
          const filtered = prev.filter(l => l.id !== selectedStockLine.id);
          // Renumerar as linhas
          return filtered.map((l, index) => ({ ...l, line: index + 1 }));
        });
        showSuccessToast('Linha de estoque excluída com sucesso');
      } catch (error) {
        console.error('Erro ao excluir linha de estoque:', error);
        showErrorToast(error instanceof Error ? error.message : 'Erro ao excluir linha de estoque');
      }
    } else {
      // Se for produto novo, apenas remover localmente
      setStockLines(prev => {
        const filtered = prev.filter(l => l.id !== selectedStockLine.id);
        // Renumerar as linhas
        return filtered.map((l, index) => ({ ...l, line: index + 1 }));
      });
    }
  };

  const handleImportExcel = () => {
    // Implementar importação de Excel
    alert('Funcionalidade de importação será implementada');
  };

  const handleExportExcel = () => {
    // Implementar exportação de Excel
    alert('Funcionalidade de exportação será implementada');
  };

  // Handlers para KeyAuth
  const handleKeyAuthChange = (field: 'keyAuthDays' | 'keyAuthPublicKey' | 'keyAuthSellerKey') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'keyAuthDays' ? Number(e.target.value) : e.target.value;
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handlers para entregáveis
  const handleAddDeliverable = () => {
    if (!newDeliverable.name.trim() || !newDeliverable.url.trim()) return;
    
    const newLink = {
      id: Date.now().toString(),
      name: newDeliverable.name.trim(),
      url: newDeliverable.url.trim()
    };
    
    setDeliverableLinks(prev => [...prev, newLink]);
    setNewDeliverable({ name: '', url: '' });
    
    // Limpar erro de deliverables quando adicionar um
    if (errors.deliverables) {
      setErrors(prev => ({
        ...prev,
        deliverables: undefined
      }));
    }
  };

  const handleEditDeliverable = (link: {id: string; name: string; url: string}) => {
    setSelectedDeliverable(link);
    setEditDeliverableModalOpen(true);
  };

  const handleConfirmEditDeliverable = async (name: string, url: string) => {
    if (!selectedDeliverable) return;

    setDeliverableLinks(prev => prev.map(l => 
      l.id === selectedDeliverable.id ? { ...l, name, url } : l
    ));
    showSuccessToast('Entregável atualizado com sucesso');
  };

  const handleDeleteDeliverable = (link: {id: string; name: string; url: string}) => {
    setSelectedDeliverable(link);
    setDeleteDeliverableModalOpen(true);
  };

  const handleConfirmDeleteDeliverable = async () => {
    if (!selectedDeliverable) return;

    setDeliverableLinks(prev => prev.filter(l => l.id !== selectedDeliverable.id));
    showSuccessToast('Entregável excluído com sucesso');
  };

  // Configuração das colunas da tabela de estoque
  const stockColumns = [
    {
      key: 'line' as keyof {id: string; line: number; content: string},
      label: 'Linha',
      width: 'w-[80px]'
    },
    {
      key: 'content' as keyof {id: string; line: number; content: string},
      label: 'Conteúdo do Estoque',
      width: 'flex-1'
    }
  ];

  // Configuração das ações da tabela
  const stockActions = [
    {
      icon: Edit,
      label: 'Editar linha',
      onClick: handleEditStockLine,
      color: 'primary'
    },
    {
      icon: Trash2,
      label: 'Excluir linha',
      onClick: handleDeleteStockLine,
      color: 'error'
    }
  ];

  // Configuração das colunas da tabela de entregáveis
  const deliverableColumns = [
    {
      key: 'name' as keyof {id: string; name: string; url: string},
      label: 'Nome do Entregável',
      width: 'w-[200px]'
    },
    {
      key: 'url' as keyof {id: string; name: string; url: string},
      label: 'URL de Download',
      width: 'flex-1'
    }
  ];

  // Configuração das ações da tabela de entregáveis
  const deliverableActions = [
    {
      icon: Edit,
      label: 'Editar entregável',
      onClick: handleEditDeliverable,
      color: 'primary'
    },
    {
      icon: Trash2,
      label: 'Excluir entregável',
      onClick: handleDeleteDeliverable,
      color: 'error'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <IconOnlyButton
            icon={ArrowLeft}
            onClick={handleBack}
            variant="surface"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {isNewProduct ? 'Criar produto' : 'Editar produto'}
              </h1>
              {categoryName && (
                <span className="text-sm font-light text-[var(--on-background)]">
                  / {categoryName}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
          title={isSaving ? 'Salvando produto...' : 'Clique para salvar (validação será feita)'}
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Produto'}
        </Button>
      </div>

      {/* Alerta de erros de validação */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
              <span className="text-red-600 dark:text-red-200 font-bold text-sm">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'campo precisa' : 'campos precisam'} ser preenchido{Object.keys(errors).length === 1 ? '' : 's'}:
              </h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Formulário */}
      <div className="space-y-8">
        {/* Grid Principal - Informações do Produto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna 1: Nome, Preço, URL do Vídeo */}
          <div className="space-y-6">
            <Input
              label="Nome do produto"
              placeholder="Digite o nome do produto"
              value={productData.name}
              onChange={handleInputChange('name')}
              error={errors.name}
              maxLength={100}
            />

            <ValueInput
              label="Preço do produto"
              value={productData.price}
              onChange={handlePriceChange}
              error={errors.price}
              placeholder="0,00"
            />

            <Input
              label="URL do vídeo (opcional)"
              placeholder="https://www.youtube.com/embed/..."
              value={productData.videoUrl}
              onChange={handleInputChange('videoUrl')}
              error={errors.videoUrl}
            />
          </div>

          {/* Coluna 2: Descrição */}
          <div className="flex flex-col h-full">
            <Description
              label="Descrição do produto"
              placeholder="Descreva detalhadamente o produto, suas características e benefícios..."
              value={productData.description}
              onChange={handleInputChange('description')}
              error={errors.description}
              maxLength={500}
              showCharCount={true}
              className="flex-1 min-h-[250px]"
            />
          </div>
        </div>

        {/* Grid de Imagens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <ImageUpload
             label="Imagem principal"
             value={productData.image1}
             onChange={handleImageChange('image1')}
             error={errors.image1}
             placeholder="Clique para fazer upload da imagem principal"
             maxSize={5}
             uploadType="product"
             productId={typeof productId === 'string' ? productId : productId?.[0]}
             imageType="image1"
           />

           <ImageUpload
             label="Segunda imagem"
             value={productData.image2}
             onChange={handleImageChange('image2')}
             error={errors.image2}
             placeholder="Clique para fazer upload da segunda imagem"
             maxSize={5}
             uploadType="product"
             productId={typeof productId === 'string' ? productId : productId?.[0]}
             imageType="image2"
           />

           <ImageUpload
             label="Terceira imagem"
             value={productData.image3}
             onChange={handleImageChange('image3')}
             error={errors.image3}
             placeholder="Clique para fazer upload da terceira imagem"
             maxSize={5}
             uploadType="product"
             productId={typeof productId === 'string' ? productId : productId?.[0]}
             imageType="image3"
           />
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--on-background)]/20 my-8"></div>

        {/* Configuração de Estoque */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Estoque
          </h2>
          
          {/* Aviso sobre bloqueio de tipo de estoque em edição */}
          {!isNewProduct && (
            <div className="text-sm font-light text-[var(--on-background)]/70 bg-[var(--surface)] border border-[var(--on-background)]/10 p-4 rounded-lg">
              <p>O tipo de estoque não pode ser alterado após a criação do produto. Para usar outro tipo, exclua este produto e crie um novo.</p>
            </div>
          )}
          
          <Tabs
            items={[
              {
                id: 'por_linha',
                label: 'Por Linha',
                icon: Hash,
                disabled: !isNewProduct && productData.stockType !== StockType.LINE,
                content: (
                  <div className="space-y-6">
                    {/* Controles de Importação/Exportação */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                      <div className="flex gap-2">
                        <Button
                          onClick={handleImportExcel}
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          <Upload size={16} />
                          Importar Excel
                        </Button>
                        <Button
                          onClick={handleExportExcel}
                          variant="secondary"
                          className="flex items-center gap-2"
                          disabled={stockLines.length === 0}
                        >
                          <Download size={16} />
                          Exportar Excel
                        </Button>
                      </div>
                    </div>

                    {/* Aviso quando não há linhas de estoque */}
                    {stockLines.length === 0 && errors.stockLines && (
                      <div className="text-sm font-light text-[var(--on-background)]/70 bg-[var(--surface)] border border-[var(--on-background)]/10 p-4 rounded-lg">
                        <p>Digite o conteúdo no campo abaixo e clique em &quot;Adicionar&quot; para criar a linha de estoque.</p>
                      </div>
                    )}

                    {/* Input para adicionar nova linha */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o conteúdo da linha de estoque..."
                        value={newStockContent}
                        onChange={(e) => setNewStockContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStockLine()}
                        className="flex-1"
                        error={stockLines.length === 0 && errors.stockLines ? 'Campo preenchido mas não adicionado' : undefined}
                      />
                      <Button
                        onClick={handleAddStockLine}
                        disabled={!newStockContent.trim()}
                        className={`flex items-center gap-2 px-4 ${newStockContent.trim() ? 'animate-pulse' : ''}`}
                      >
                        <Plus size={16} />
                        Adicionar
                      </Button>
                    </div>

                    {/* Tabela de Estoque */}
                    <Table
                      data={stockLines}
                      columns={stockColumns}
                      actions={stockActions}
                      itemsPerPage={50}
                      emptyMessage="Nenhuma linha de estoque adicionada. Use o campo acima para adicionar."
                    />

                    {/* Erro de linhas de estoque */}
                    {errors.stockLines && (
                      <div className="text-sm text-red-500 mt-2">
                        {errors.stockLines}
                      </div>
                    )}

                    {/* Informações */}
                    {stockLines.length > 0 && (
                      <div className="text-sm font-light text-[var(--on-background)]/70 bg-[var(--surface)] border border-[var(--on-background)]/10 p-4 rounded-lg">
                        <p>Total de linhas: {stockLines.length}</p>
                        <p className="mt-1">Cada linha representa uma unidade de estoque que será entregue ao cliente após a compra.</p>
                      </div>
                    )}
                  </div>
                )
              },
              {
                id: 'fixo',
                label: 'Fixo',
                icon: Box,
                disabled: !isNewProduct && productData.stockType !== StockType.FIXED,
                content: (
                  <div className="py-6">
                    <Description
                      label="Conteúdo a ser entregue"
                      placeholder="Digite o conteúdo que será entregue..."
                      value={productData.fixedContent || ''}
                      onChange={(e) => setProductData(prev => ({ ...prev, fixedContent: e.target.value }))}
                      error={errors.fixedContent}
                      maxLength={2000}
                      showCharCount={true}
                      className="min-h-[200px]"
                    />
                  </div>
                )
              },
              {
                id: 'keyauth',
                label: 'KeyAuth',
                icon: Key,
                disabled: !isNewProduct && productData.stockType !== StockType.KEYAUTH,
                content: (
                  <div className="space-y-6">
                    {/* Número de dias */}
                    <Input
                      label="Número de dias"
                      type="number"
                      placeholder="30"
                      value={productData.keyAuthDays?.toString() || ''}
                      onChange={handleKeyAuthChange('keyAuthDays')}
                      error={errors.keyAuthDays}
                      min="1"
                      max="3650"
                    />

                    {/* Public Key */}
                    <Input
                      label="Chave pública"
                      placeholder="Digite sua chave pública KeyAuth"
                      value={productData.keyAuthPublicKey || ''}
                      onChange={handleKeyAuthChange('keyAuthPublicKey')}
                      error={errors.keyAuthPublicKey}
                    />

                    {/* Seller Key */}
                    <Input
                      label="Seller key"
                      placeholder="Digite sua chave de vendedor KeyAuth"
                      value={productData.keyAuthSellerKey || ''}
                      onChange={handleKeyAuthChange('keyAuthSellerKey')}
                      error={errors.keyAuthSellerKey}
                    />
                  </div>
                )
              }
            ]}
            activeTab={activeStockTab}
            onChange={(tabId) => {
              // Permitir troca de tab apenas em modo de criação
              if (isNewProduct) {
                setActiveStockTab(tabId);
                // Atualizar o stockType quando trocar de tab
                switch (tabId) {
                  case 'por_linha':
                    setProductData(prev => ({ ...prev, stockType: StockType.LINE }));
                    break;
                  case 'fixo':
                    setProductData(prev => ({ ...prev, stockType: StockType.FIXED }));
                    break;
                  case 'keyauth':
                    setProductData(prev => ({ ...prev, stockType: StockType.KEYAUTH }));
                    break;
                }
              }
            }}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--on-background)]/20 my-8"></div>

        {/* Seção de Entregáveis */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Entregável
          </h2>
          
          {/* Inputs para adicionar novo entregável */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Digite o nome do entregável..."
              value={newDeliverable.name}
              onChange={(e) => setNewDeliverable(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDeliverable()}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Digite a URL de download..."
                value={newDeliverable.url}
                onChange={(e) => setNewDeliverable(prev => ({ ...prev, url: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDeliverable()}
                className="flex-1"
              />
              <Button
                onClick={handleAddDeliverable}
                disabled={!newDeliverable.name.trim() || !newDeliverable.url.trim()}
                className="flex items-center gap-2 px-4"
              >
                <Plus size={16} />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Tabela de Entregáveis */}
          <div className="max-h-96 overflow-y-auto">
            <Table
              data={deliverableLinks}
              columns={deliverableColumns}
              actions={deliverableActions}
              itemsPerPage={50}
              emptyMessage="Nenhum entregável adicionado. Use os campos acima para adicionar links de download."
            />
          </div>

          {/* Informações */}
          {deliverableLinks.length > 0 && (
            <div className="text-sm font-light text-[var(--on-background)]/70 bg-[var(--surface)] border border-[var(--on-background)]/10 p-4 rounded-lg">
              <p>Total de entregáveis: {deliverableLinks.length}</p>
              <p className="mt-1">Links que serão disponibilizados para download após a compra do produto.</p>
            </div>
          )}
        </div>

        {/* Botão de Ação - Mobile */}
        <div className="lg:hidden pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 flex items-center justify-center gap-2"
            title={isSaving ? 'Salvando produto...' : 'Clique para salvar (validação será feita)'}
          >
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Produto'}
          </Button>
        </div>
      </div>

      {/* Modais de Estoque */}
      {selectedStockLine && (
        <>
          <EditStockLineModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedStockLine(null);
            }}
            onConfirm={handleConfirmEditStockLine}
            currentContent={selectedStockLine.content}
          />
          <DeleteStockLineModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedStockLine(null);
            }}
            onConfirm={handleConfirmDeleteStockLine}
            content={selectedStockLine.content}
          />
        </>
      )}

      {/* Modais de Entregáveis */}
      {selectedDeliverable && (
        <>
          <EditDeliverableModal
            isOpen={editDeliverableModalOpen}
            onClose={() => {
              setEditDeliverableModalOpen(false);
              setSelectedDeliverable(null);
            }}
            onConfirm={handleConfirmEditDeliverable}
            currentName={selectedDeliverable.name}
            currentUrl={selectedDeliverable.url}
          />
          <DeleteDeliverableModal
            isOpen={deleteDeliverableModalOpen}
            onClose={() => {
              setDeleteDeliverableModalOpen(false);
              setSelectedDeliverable(null);
            }}
            onConfirm={handleConfirmDeleteDeliverable}
            name={selectedDeliverable.name}
          />
        </>
      )}
    </div>
  );
}
