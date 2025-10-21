'use client';

import { useState } from 'react';
import Input from '@/app/components/inputs/input';
import ImageUpload from '@/app/components/images/imageUpload';
import ColorPicker from '@/app/components/inputs/colorPicker';
import Button from '@/app/components/buttons/button';
import DomainModal from '@/app/components/modals/domainModal';
import { Save, Settings, Store as StoreIcon, Palette, Image, Globe } from 'lucide-react';

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
  customDomain: string;
  subdomain: string;
  sslEnabled: boolean;
}

export default function Store() {
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    storeName: '',
    contactEmail: '',
    logoUrl: '',
    homeBannerUrl: '',
    storeBannerUrl: '',
    primaryColor: '#6200EE',
    secondaryColor: '#03DAC6'
  });

  const [domainConfig, setDomainConfig] = useState<DomainConfig>({
    customDomain: '',
    subdomain: '',
    sslEnabled: true
  });

  const handleInputChange = (field: keyof StoreConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStoreConfig(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleColorChange = (field: 'primaryColor') => (
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
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  };

  const handleSave = () => {
    console.log('Salvando configurações da loja:', storeConfig);
    // Implementar lógica de salvamento
  };

  const handleDomainSave = (config: DomainConfig) => {
    console.log('Salvando configurações do domínio:', config);
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
            value={storeConfig.logoUrl}
            onChange={(file, preview) => {
              if (preview) {
                setStoreConfig(prev => ({ ...prev, logoUrl: preview }));
              }
            }}
            placeholder="Arraste seu logotipo aqui ou clique para selecionar"
            maxSize={5}
            error=""
          />
          
          <ImageUpload
            label="Banner da tela inicial"
            value={storeConfig.homeBannerUrl}
            onChange={(file, preview) => {
              if (preview) {
                setStoreConfig(prev => ({ ...prev, homeBannerUrl: preview }));
              }
            }}
            placeholder="Arraste o banner da tela inicial aqui"
            maxSize={10}
            error=""
          />
          
          <ImageUpload
            label="Banner da loja"
            value={storeConfig.storeBannerUrl}
            onChange={(file, preview) => {
              if (preview) {
                setStoreConfig(prev => ({ ...prev, storeBannerUrl: preview }));
              }
            }}
            placeholder="Arraste o banner da loja aqui"
            maxSize={10}
            error=""
          />
        </div>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Loja          
        </h1>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsDomainModalOpen(true)}
            className="flex items-center gap-2 bg-transparent text-[var(--on-surface)] hover:bg-gray-100 border border-[var(--on-background)]"
          >
            <Globe size={18} />
            Configurar domínio
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            Salvar configurações
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