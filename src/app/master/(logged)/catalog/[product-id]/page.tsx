'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Box, Hash, Key, Edit, Trash2, Upload, Download, Plus } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
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
import { ProductFormData, StockType, DeliverableFormData } from '@/lib/types';

export default function CatalogProductPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params['product-id'];
  const isNewProduct = productId === 'new';
  const categoryId = searchParams.get('categoryId');
  const [catalogCategoryId, setCatalogCategoryId] = useState<string | null>(categoryId);

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
    keyAuthSellerKey: ''
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeStockTab, setActiveStockTab] = useState('por_linha');
  const [categoryName, setCategoryName] = useState<string>('');
  
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

  // Carregar nome da categoria e (se editando) dados do produto
  useEffect(() => {
    const loadData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) return;
        const headers = { 'Authorization': `Bearer ${accessToken}` } as const;

        if (categoryId) {
          const r = await fetch(`/api/master/catalog/categories`, { headers, cache: 'no-store' });
          const d = await r.json();
          if (r.ok && Array.isArray(d?.data?.categories)) {
            interface CategoryResponse {
              id: string;
              name: string;
            }
            const cat = (d.data.categories as CategoryResponse[]).find((c) => c.id === categoryId);
            if (cat) setCategoryName(cat.name);
          }
        }

        // Se edição, buscar produto
        if (!isNewProduct) {
          const id = typeof productId === 'string' ? productId : productId?.[0];
          const r = await fetch(`/api/master/catalog/products/${id}`, { headers, cache: 'no-store' });
          const d = await r.json();
          if (r.ok && d?.data?.product) {
            const p = d.data.product;
            if (p.catalogCategoryId && !categoryId) {
              setCatalogCategoryId(p.catalogCategoryId);
            }
            setProductData(prev => ({
              ...prev,
              name: p.name || '',
              description: p.description || '',
              price: p.price || 0,
              videoUrl: p.videoUrl || '',
              image1: p.imageUrl ? { url: p.imageUrl } : null,
              image2: p.image2Url ? { url: p.image2Url } : null,
              image3: p.image3Url ? { url: p.image3Url } : null,
              image1Url: p.imageUrl || undefined,
              image2Url: p.image2Url || undefined,
              image3Url: p.image3Url || undefined,
              stockType: p.stockType,
              fixedContent: p.fixedContent || '',
              keyAuthDays: p.keyAuthDays || 0,
              keyAuthSellerKey: p.keyAuthSellerKey || '',
            }));
            setActiveStockTab(stockTypeToTabId(p.stockType));
            
            // Carregar stockLines se existirem
            if (p.stockLines && Array.isArray(p.stockLines)) {
              interface StockLineResponse {
                id?: string;
                content: string;
              }
              setStockLines((p.stockLines as StockLineResponse[]).map((line, index) => ({
                id: line.id || Date.now().toString() + index,
                line: index + 1,
                content: line.content || ''
              })));
            }
            
            // Carregar deliverables se existirem
            if (p.deliverables && Array.isArray(p.deliverables)) {
              interface DeliverableResponse {
                id?: string;
                name: string;
                url: string;
              }
              setDeliverableLinks((p.deliverables as DeliverableResponse[]).map((del, index) => ({
                id: del.id || Date.now().toString() + index,
                name: del.name || '',
                url: del.url || ''
              })));
            }
          }
        }
      } catch {
        // silencioso
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewProduct, categoryId]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProductData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
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
    
    if (value > 0 && value < 5) {
      setErrors(prev => ({
        ...prev,
        price: 'Preço mínimo é R$ 5,00'
      }));
    } else if (errors.price) {
      setErrors(prev => ({
        ...prev,
        price: undefined
      }));
    }
  };

  const handleImageChange = (imageKey: 'image1' | 'image2' | 'image3') => (file: File | null, url?: string) => {
    const urlKey = `${imageKey}Url` as 'image1Url' | 'image2Url' | 'image3Url';
    
    if (url) {
      setProductData(prev => ({
        ...prev,
        [imageKey]: { url },
        [urlKey]: url
      }));
    } else {
      setProductData(prev => ({
        ...prev,
        [imageKey]: null,
        [urlKey]: undefined
      }));
    }
    
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
    } else if (productData.price < 5) {
      newErrors.price = 'Preço mínimo é R$ 5,00';
      errorMessages.push('❌ Preço mínimo de R$ 5,00');
    }

    const hasImage = productData.image1Url || 
                     (productData.image1 && typeof productData.image1 === 'object' && 'url' in productData.image1);
    
    if (!hasImage) {
      newErrors.image1 = 'Pelo menos uma imagem é obrigatória';
      errorMessages.push('❌ Pelo menos 1 imagem do produto');
    }

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
    
    if (errorMessages.length > 0) {
      showErrorToast(
        `Preencha os campos obrigatórios (${errorMessages.length} ${errorMessages.length === 1 ? 'pendente' : 'pendentes'})`
      );
      
      setTimeout(() => {
        showErrorToast(
          `Campos pendentes: ${errorMessages.join(', ')}`
        );
      }, 300);
      
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

    setIsSaving(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Sessão expirada');

      // Montar payload
      interface ProductPayload {
        name: string;
        description: string;
        price: number;
        videoUrl: string | null;
        imageUrl: string | null;
        image2Url: string | null;
        image3Url: string | null;
        stockType: StockType;
        fixedContent: string | null;
        keyAuthDays: number | null;
        keyAuthSellerKey: string | null;
        isCatalog: boolean;
        catalogCategoryId: string;
        stockLines: Array<{ content: string }>;
        deliverables: Array<{ name: string; url: string }>;
      }
      const body: ProductPayload = {
        name: productData.name.trim(),
        description: productData.description.trim(),
        price: Number(productData.price),
        videoUrl: productData.videoUrl?.trim() || null,
        imageUrl: productData.image1Url || null,
        image2Url: productData.image2Url || null,
        image3Url: productData.image3Url || null,
        stockType: productData.stockType,
        fixedContent: productData.fixedContent || null,
        keyAuthDays: productData.keyAuthDays || null,
        keyAuthSellerKey: productData.keyAuthSellerKey || null,
        isCatalog: true,
        catalogCategoryId: catalogCategoryId || categoryId,
        // Incluir stockLines e deliverables se existirem
        stockLines: productData.stockType === StockType.LINE && stockLines.length > 0
          ? stockLines.map(line => ({ content: line.content }))
          : [],
        deliverables: deliverableLinks.length > 0
          ? deliverableLinks.map(link => ({ name: link.name, url: link.url }))
          : [],
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      } as const;

      if (isNewProduct) {
        if (!categoryId) throw new Error('Categoria do catálogo é obrigatória');
        const res = await fetch('/api/master/catalog/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao criar produto');
      } else {
        const id = typeof productId === 'string' ? productId : productId?.[0];
        // Para edição, incluir stockLines e deliverables também
        body.stockLines = productData.stockType === StockType.LINE && stockLines.length > 0
          ? stockLines.map(line => ({ content: line.content }))
          : [];
        body.deliverables = deliverableLinks.length > 0
          ? deliverableLinks.map(link => ({ name: link.name, url: link.url }))
          : [];
        
        const res = await fetch(`/api/master/catalog/products/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar produto');
      }

      showSuccessToast(isNewProduct ? 'Produto do catálogo criado com sucesso!' : 'Produto do catálogo atualizado com sucesso!');
      router.push('/master/catalog');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erro ao salvar produto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStockLine = () => {
    if (!newStockContent.trim()) return;
    
    const newLine = {
      id: Date.now().toString(),
      line: stockLines.length + 1,
      content: newStockContent.trim()
    };
    
    setStockLines(prev => [...prev, newLine]);
    setNewStockContent('');
    
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

    setStockLines(prev => prev.map(l => 
      l.id === selectedStockLine.id ? { ...l, content } : l
    ));
    showSuccessToast('Linha de estoque atualizada com sucesso');
  };

  const handleDeleteStockLine = (line: {id: string; line: number; content: string}) => {
    setSelectedStockLine(line);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteStockLine = async () => {
    if (!selectedStockLine) return;

    setStockLines(prev => {
      const filtered = prev.filter(l => l.id !== selectedStockLine.id);
      return filtered.map((l, index) => ({ ...l, line: index + 1 }));
    });
  };

  const handleImportExcel = () => {
    alert('Funcionalidade de importação será implementada');
  };

  const handleExportExcel = () => {
    alert('Funcionalidade de exportação será implementada');
  };

  const handleKeyAuthChange = (field: 'keyAuthDays' | 'keyAuthSellerKey') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'keyAuthDays' ? Number(e.target.value) : e.target.value;
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDeliverable = () => {
    if (!newDeliverable.name.trim() || !newDeliverable.url.trim()) return;
    
    const newLink = {
      id: Date.now().toString(),
      name: newDeliverable.name.trim(),
      url: newDeliverable.url.trim()
    };
    
    setDeliverableLinks(prev => [...prev, newLink]);
    setNewDeliverable({ name: '', url: '' });
    
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
                {isNewProduct ? 'Criar produto do catálogo' : 'Editar produto do catálogo'}
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
          {isSaving ? 'Salvando...' : 'Salvar produto'}
        </Button>
      </div>

      {/* Alerta de erros de validação */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--error)]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--error)]/10 flex items-center justify-center">
              <span className="text-[var(--error)] font-bold text-sm">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'campo precisa' : 'campos precisam'} ser preenchido{Object.keys(errors).length === 1 ? '' : 's'}:
              </h3>
              <ul className="text-sm text-[var(--on-background)] space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start gap-2">
                    <span className="text-[var(--error)] mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
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

                    {stockLines.length === 0 && errors.stockLines && (
                      <div className="text-sm font-light text-[var(--on-background)]/70 bg-[var(--surface)] border border-[var(--on-background)]/10 p-4 rounded-lg">
                        <p>Digite o conteúdo no campo abaixo e clique em &quot;Adicionar&quot; para criar a linha de estoque.</p>
                      </div>
                    )}

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

                    <Table
                      data={stockLines}
                      columns={stockColumns}
                      actions={stockActions}
                      itemsPerPage={50}
                      emptyMessage="Nenhuma linha de estoque adicionada. Use o campo acima para adicionar."
                    />

                    {errors.stockLines && (
                      <div className="text-sm text-red-500 mt-2">
                        {errors.stockLines}
                      </div>
                    )}

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
              if (isNewProduct) {
                setActiveStockTab(tabId);
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

          <div className="max-h-96 overflow-y-auto">
            <Table
              data={deliverableLinks}
              columns={deliverableColumns}
              actions={deliverableActions}
              itemsPerPage={50}
              emptyMessage="Nenhum entregável adicionado. Use os campos acima para adicionar links de download."
            />
          </div>

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
            {isSaving ? 'Salvando...' : 'Salvar produto'}
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
