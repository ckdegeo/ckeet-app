'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Box, Hash, Key, Edit, Trash2, Upload, Download, Plus } from 'lucide-react';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import Button from '@/app/components/buttons/button';
import Input from '@/app/components/inputs/input';
import Description from '@/app/components/inputs/description';
import ValueInput from '@/app/components/inputs/valueInput';
import Tabs from '@/app/components/tabs/tabs';
import Table from '@/app/components/tables/table';
import ImageUpload from '@/app/components/images/imageUpload';
import { ProductFormData, StockType, StockLineFormData, DeliverableFormData } from '@/lib/types';

// Dados do produto e configurações

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params['product-id'];
  const isNewProduct = productId === 'new';

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

  const [imagePreviews, setImagePreviews] = useState({
    image1: '',
    image2: '',
    image3: ''
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeStockTab, setActiveStockTab] = useState('por_linha');
  
  // Estados para estoque por linha
  const [stockLines, setStockLines] = useState<Array<{id: string; line: number; content: string}>>([]);
  const [newStockContent, setNewStockContent] = useState('');
  
  // Estados para entregáveis
  const [deliverableLinks, setDeliverableLinks] = useState<Array<{id: string; name: string; url: string}>>([]);
  const [newDeliverable, setNewDeliverable] = useState<DeliverableFormData>({
    name: '',
    url: ''
  });

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

  const handleImageChange = (imageKey: 'image1' | 'image2' | 'image3') => (file: File | null, preview: string | null) => {
    setProductData(prev => ({
      ...prev,
      [imageKey]: file
    }));
    
    setImagePreviews(prev => ({
      ...prev,
      [imageKey]: preview || ''
    }));
    
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

    if (!productData.name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    }

    if (!productData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (productData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (!productData.image1) {
      newErrors.image1 = 'Pelo menos uma imagem é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Produto salvo:', productData);
      
      // Redirecionar para lista de produtos
      router.push('/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Funções para estoque por linha
  const handleAddStockLine = () => {
    if (!newStockContent.trim()) return;
    
    const newLine = {
      id: Date.now().toString(),
      line: stockLines.length + 1,
      content: newStockContent.trim()
    };
    
    setStockLines(prev => [...prev, newLine]);
    setNewStockContent('');
  };

  const handleEditStockLine = (line: {id: string; line: number; content: string}) => {
    const newContent = prompt('Editar conteúdo da linha:', line.content);
    if (newContent !== null && newContent.trim()) {
      setStockLines(prev => prev.map(l => 
        l.id === line.id ? { ...l, content: newContent.trim() } : l
      ));
    }
  };

  const handleDeleteStockLine = (line: {id: string; line: number; content: string}) => {
    if (confirm('Tem certeza que deseja excluir esta linha de estoque?')) {
      setStockLines(prev => {
        const filtered = prev.filter(l => l.id !== line.id);
        // Renumerar as linhas
        return filtered.map((l, index) => ({ ...l, line: index + 1 }));
      });
    }
  };

  const handleImportExcel = () => {
    // Implementar importação de Excel
    console.log('Importar Excel');
    alert('Funcionalidade de importação será implementada');
  };

  const handleExportExcel = () => {
    // Implementar exportação de Excel
    console.log('Exportar Excel:', stockLines);
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
  };

  const handleEditDeliverable = (link: {id: string; name: string; url: string}) => {
    const newName = prompt('Editar nome do entregável:', link.name);
    if (newName !== null && newName.trim()) {
      const newUrl = prompt('Editar URL do entregável:', link.url);
      if (newUrl !== null && newUrl.trim()) {
        setDeliverableLinks(prev => prev.map(l => 
          l.id === link.id ? { ...l, name: newName.trim(), url: newUrl.trim() } : l
        ));
      }
    }
  };

  const handleDeleteDeliverable = (link: {id: string; name: string; url: string}) => {
    if (confirm('Tem certeza que deseja excluir este entregável?')) {
      setDeliverableLinks(prev => prev.filter(l => l.id !== link.id));
    }
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {isNewProduct ? 'Criar Produto' : `Editar Produto ${productId}`}
          </h1>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Produto'}
        </Button>
      </div>

      {/* Formulário */}
      <div className="space-y-8">
        {/* Nome do Produto */}
        <Input
          label="Nome do produto"
          placeholder="Digite o nome do produto"
          value={productData.name}
          onChange={handleInputChange('name')}
          error={errors.name}
          maxLength={100}
        />

        {/* Descrição */}
        <Description
          label="Descrição do produto"
          placeholder="Descreva detalhadamente o produto, suas características e benefícios..."
          value={productData.description}
          onChange={handleInputChange('description')}
          error={errors.description}
          maxLength={500}
          showCharCount={true}
        />

        {/* Grid de Preço e Vídeo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Grid de Imagens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUpload
            label="Imagem principal"
            value={imagePreviews.image1}
            onChange={handleImageChange('image1')}
            error={errors.image1}
            placeholder="Clique para fazer upload da imagem principal"
            maxSize={5}
          />

          <ImageUpload
            label="Segunda imagem"
            value={imagePreviews.image2}
            onChange={handleImageChange('image2')}
            error={errors.image2}
            placeholder="Clique para fazer upload da segunda imagem"
            maxSize={5}
          />

          <ImageUpload
            label="Terceira imagem"
            value={imagePreviews.image3}
            onChange={handleImageChange('image3')}
            error={errors.image3}
            placeholder="Clique para fazer upload da terceira imagem"
            maxSize={5}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--on-background)]/20 my-8"></div>

        {/* Configuração de Estoque */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Estoque
          </h2>
          
          <Tabs
            items={[
              {
                id: 'por_linha',
                label: 'Por Linha',
                icon: Hash,
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

                    {/* Input para adicionar nova linha */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o conteúdo da linha de estoque..."
                        value={newStockContent}
                        onChange={(e) => setNewStockContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStockLine()}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddStockLine}
                        disabled={!newStockContent.trim()}
                        className="flex items-center gap-2 px-4"
                      >
                        <Plus size={16} />
                        Adicionar
                      </Button>
                    </div>

                    {/* Tabela de Estoque */}
                    <div className="max-h-96 overflow-y-auto">
                      <Table
                        data={stockLines}
                        columns={stockColumns}
                        actions={stockActions}
                        itemsPerPage={50}
                        emptyMessage="Nenhuma linha de estoque adicionada. Use o campo acima para adicionar."
                      />
                    </div>

                    {/* Informações */}
                    {stockLines.length > 0 && (
                      <div className="text-sm text-[var(--on-background)] bg-[var(--surface)] p-3 rounded-lg">
                        <p><strong>Total de linhas:</strong> {stockLines.length}</p>
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
                content: (
                  <div className="py-6">
                    <Description
                      label="Conteúdo a ser entregue"
                      placeholder="Digite o conteúdo que será entregue..."
                      value={productData.fixedContent || ''}
                      onChange={(e) => setProductData(prev => ({ ...prev, fixedContent: e.target.value }))}
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
                content: (
                  <div className="space-y-6">
                    {/* Número de dias */}
                    <Input
                      label="Número de dias"
                      type="number"
                      placeholder="30"
                      value={productData.keyAuthDays?.toString() || ''}
                      onChange={handleKeyAuthChange('keyAuthDays')}
                      min="1"
                      max="3650"
                    />

                    {/* Public Key */}
                    <Input
                      label="Chave pública"
                      placeholder="Digite sua chave pública KeyAuth"
                      value={productData.keyAuthPublicKey || ''}
                      onChange={handleKeyAuthChange('keyAuthPublicKey')}
                    />

                    {/* Seller Key */}
                    <Input
                      label="Seller key"
                      placeholder="Digite sua chave de vendedor KeyAuth"
                      value={productData.keyAuthSellerKey || ''}
                      onChange={handleKeyAuthChange('keyAuthSellerKey')}
                    />
                  </div>
                )
              }
            ]}
            activeTab={activeStockTab}
            onChange={(tabId) => setActiveStockTab(tabId)}
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
            <div className="text-sm text-[var(--on-background)] bg-[var(--surface)] p-3 rounded-lg">
              <p><strong>Total de entregáveis:</strong> {deliverableLinks.length}</p>
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
          >
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar Produto'}
          </Button>
        </div>
      </div>
    </div>
  );
}
