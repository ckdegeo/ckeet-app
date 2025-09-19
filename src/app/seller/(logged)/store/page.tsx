'use client';

import { useState } from 'react';
import Input from '@/app/components/inputs/input';
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna Esquerda */}
      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <StoreIcon size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Informações Básicas
            </h2>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Nome da Loja"
              placeholder="Digite o nome da sua loja"
              value={storeConfig.storeName}
              onChange={handleInputChange('storeName')}
            />
            
            <Input
              label="Email de Contato"
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
              Cores da Loja
            </h2>
          </div>
          
          <div className="space-y-4">
            <ColorPicker
              label="Cor Primária"
              value={storeConfig.primaryColor}
              onChange={handleColorChange('primaryColor')}
            />
            
            <ColorPicker
              label="Cor Secundária"
              value={storeConfig.secondaryColor}
              onChange={handleColorChange('secondaryColor')}
            />
          </div>
        </div>
      </div>

      {/* Coluna Direita */}
      <div className="space-y-6">
        {/* Imagens e Banners */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Imagens
            </h2>
          </div>
          
          <div className="space-y-4">
            <Input
              label="URL do Logotipo"
              placeholder="https://exemplo.com/logo.png"
              value={storeConfig.logoUrl}
              onChange={handleInputChange('logoUrl')}
            />
            
            <Input
              label="Banner da Tela Inicial"
              placeholder="https://exemplo.com/banner-home.jpg"
              value={storeConfig.homeBannerUrl}
              onChange={handleInputChange('homeBannerUrl')}
            />
            
            <Input
              label="Banner da Loja"
              placeholder="https://exemplo.com/banner-loja.jpg"
              value={storeConfig.storeBannerUrl}
              onChange={handleInputChange('storeBannerUrl')}
            />
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Configurações da Loja          
        </h1>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsDomainModalOpen(true)}
            className="flex items-center gap-2 bg-transparent text-[var(--on-surface)] hover:bg-gray-100 border border-[var(--on-background)]"
          >
            <Globe size={18} />
            Configurar Domínio
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            Salvar Configurações
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