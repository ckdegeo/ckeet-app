'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Input from '@/app/components/inputs/input';
import ImageUpload from '@/app/components/images/imageUpload';
import ColorPicker from '@/app/components/inputs/colorPicker';
import Button from '@/app/components/buttons/button';
import DomainModal from '@/app/components/modals/domainModal';
import { Save, Settings, Store as StoreIcon, Palette, Image, Globe } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
import { getAccessToken } from '@/lib/utils/authUtils';
import { useStoreConfigCache } from '@/lib/hooks/useCache';

// Interface para os dados da loja
interface StoreConfig {
  storeName: string;
  contactEmail: string;
  logoUrl: string;
  homeBannerUrl: string;
  storeBannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

// Interface para dados do domínio
interface DomainConfig {
  subdomain: string;
}

function StorePageContent() {
  const searchParams = useSearchParams();
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);

  // Usar cache para carregar dados da loja
  const { data: storeData, loading: storeLoading, error: storeError, refresh: refreshStoreData } = useStoreConfigCache();

  // Verificar se veio do middleware e mostrar toast
  useEffect(() => {
    if (searchParams.get('incomplete') === 'true') {
      showErrorToast('Complete a configuração da sua loja para acessar outras funcionalidades');
    }
  }, [searchParams]);

  // Carregar dados do cache para o estado local
  useEffect(() => {
    if (storeData?.store) {
      setStoreConfig({
        storeName: storeData.store.name || '',
        contactEmail: storeData.store.contactEmail || '',
        logoUrl: storeData.store.logoUrl || '',
        homeBannerUrl: storeData.store.homeBannerUrl || '',
        storeBannerUrl: storeData.store.storeBannerUrl || '',
        primaryColor: storeData.store.primaryColor || '#bd253c',
        secondaryColor: storeData.store.secondaryColor || '#970b27'
      });
    }
  }, [storeData]);
  
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    storeName: '',
    contactEmail: '',
    logoUrl: '',
    homeBannerUrl: '',
    storeBannerUrl: '',
    primaryColor: '#bd253c',
    secondaryColor: '#970b27'
  });

  const [domainConfig, setDomainConfig] = useState<DomainConfig>({
    subdomain: ''
  });

  const handleInputChange = (field: keyof StoreConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStoreConfig(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor') => (
    color: string
  ) => {
    setStoreConfig(prev => ({
      ...prev,
      [field]: color
    }));
  };

  const handleDomainChange = (field: keyof DomainConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDomainConfig(prev => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? String(e.target.checked) : e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      // Verificar se todos os campos obrigatórios estão preenchidos
      const requiredFields = [
        { field: 'storeName', label: 'Nome da loja' },
        { field: 'contactEmail', label: 'Email de contato' },
        { field: 'logoUrl', label: 'Logotipo da loja' },
        { field: 'homeBannerUrl', label: 'Banner da tela inicial' },
        { field: 'storeBannerUrl', label: 'Banner da loja' }
      ];

      const missingFields = requiredFields.filter(({ field }) => {
        const value = storeConfig[field as keyof StoreConfig];
        return !value || value.trim() === '';
      });

      if (missingFields.length > 0) {
        const missingLabels = missingFields.map(({ label }) => label).join(', ');
        showErrorToast(`Campos obrigatórios: ${missingLabels}`);
        return;
      }

      // Obter token de acesso
      const accessToken = getAccessToken();
      if (!accessToken) {
        showErrorToast('Token de acesso não encontrado');
        return;
      }

              const requestData = {
                name: storeConfig.storeName,
                contactEmail: storeConfig.contactEmail,
                logoUrl: storeConfig.logoUrl,
                homeBannerUrl: storeConfig.homeBannerUrl,
                storeBannerUrl: storeConfig.storeBannerUrl,
                primaryColor: storeConfig.primaryColor,
                secondaryColor: storeConfig.secondaryColor,
              };

      // Salvar configurações da loja
      const response = await fetch('/api/seller/store/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar configurações');
      }

      showSuccessToast('Configurações da loja salvas com sucesso!');
      
      // Limpar cache e recarregar dados
      refreshStoreData();
      
      // Redirecionar para dashboard após salvar com sucesso
      setTimeout(() => {
        window.location.href = '/seller/dashboard';
      }, 1500);

            } catch (error) {
              showErrorToast(error instanceof Error ? error.message : 'Erro ao salvar configurações');
            }
  };

  const handleDomainSave = (config: DomainConfig) => {
    setDomainConfig(config);
    // Implementar lógica de salvamento do domínio
  };


  // Conteúdo das configurações da loja
  const storeContent = (
    <div className="space-y-6">
      {/* Grid de 2 colunas para Informações Básicas e Cores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <StoreIcon size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Informações básicas
            </h2> 
          </div>
          
          <div className="space-y-4">
            <Input
              label="Nome da loja"
              placeholder="Digite o nome da sua loja"
              value={storeConfig.storeName}
              onChange={handleInputChange('storeName')}
            />
            
            <Input
              label="Email de contato"
              type="email"
              placeholder="contato@minhaloja.com"
              value={storeConfig.contactEmail}
              onChange={handleInputChange('contactEmail')}
            />
          </div>
        </div>

        {/* Personalização de Cores */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Cores da loja
            </h2>
          </div>
          
          <div className="space-y-4">
            <ColorPicker
              label="Cor primária"
              value={storeConfig.primaryColor}
              onChange={handleColorChange('primaryColor')}
            />
            <ColorPicker
              label="Cor secundária"
              value={storeConfig.secondaryColor}
              onChange={handleColorChange('secondaryColor')}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-black/10" />

      {/* Seção de Imagens */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Image size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Imagens
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ImageUpload
            label="Logotipo da loja"
            value={storeConfig.logoUrl ? { url: storeConfig.logoUrl } : null}
            onChange={(file, url) => {
              if (file && url) {
                setStoreConfig(prev => ({ ...prev, logoUrl: url }));
              } else if (file === null) {
                // Quando file é null, significa que a imagem foi removida
                setStoreConfig(prev => ({ ...prev, logoUrl: '' }));
              }
            }}
            placeholder="Arraste seu logotipo aqui ou clique para selecionar"
            maxSize={5}
            error=""
            folder="logos"
          />
          
          <ImageUpload
            label="Banner da tela inicial"
            value={storeConfig.homeBannerUrl ? { url: storeConfig.homeBannerUrl } : null}
            onChange={(file, url) => {
              if (file && url) {
                setStoreConfig(prev => ({ ...prev, homeBannerUrl: url }));
              } else if (file === null) {
                // Quando file é null, significa que a imagem foi removida
                setStoreConfig(prev => ({ ...prev, homeBannerUrl: '' }));
              }
            }}
            placeholder="Arraste o banner da tela inicial aqui"
            maxSize={10}
            error=""
            folder="home-banner"
          />
          
          <ImageUpload
            label="Banner da loja"
            value={storeConfig.storeBannerUrl ? { url: storeConfig.storeBannerUrl } : null}
            onChange={(file, url) => {
              if (file && url) {
                setStoreConfig(prev => ({ ...prev, storeBannerUrl: url }));
              } else if (file === null) {
                // Quando file é null, significa que a imagem foi removida
                setStoreConfig(prev => ({ ...prev, storeBannerUrl: '' }));
              }
            }}
            placeholder="Arraste o banner da loja aqui"
            maxSize={10}
            error=""
            folder="store-banner"
          />
        </div>
      </div>
    </div>
  );


  // Mostrar loading se estiver carregando
  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--on-background)]">Carregando configurações da loja...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (storeError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            Erro ao carregar configurações
          </h3>
          <p className="text-[var(--on-background)] mb-4">{storeError}</p>
          <Button onClick={() => refreshStoreData()} className="flex items-center gap-2">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Loja          
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            Salvar
          </Button>
        </div>
      </div>

      {/* Conteúdo da Loja */}
      {storeContent}

      {/* Modal de Domínio */}
      <DomainModal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        onSave={handleDomainSave}
        initialConfig={domainConfig}
      />
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <StorePageContent />
    </Suspense>
  );
}