'use client';

import { useState } from 'react';
import Input from '@/app/components/inputs/input';
import ColorPicker from '@/app/components/inputs/colorPicker';
import Button from '@/app/components/buttons/button';
import Tabs from '@/app/components/tabs/tabs';
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
  const [activeTab, setActiveTab] = useState('domain');
  
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
    if (activeTab === 'domain') {
      console.log('Salvando configurações do domínio:', domainConfig);
    } else {
      console.log('Salvando configurações da loja:', storeConfig);
    }
    // Implementar lógica de salvamento
  };

  // Conteúdo da aba Domínio
  const domainTabContent = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna Esquerda */}
      <div className="space-y-6">
        {/* Configurações de Domínio */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Configurações de Domínio
            </h2>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Subdomínio"
              placeholder="minhaloja"
              value={domainConfig.subdomain}
              onChange={handleDomainChange('subdomain')}
            />
            <p className="text-sm text-[var(--on-background)]">
              Sua loja ficará disponível em: <strong>{domainConfig.subdomain || 'minhaloja'}.ckeet.com</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Coluna Direita */}
      <div className="space-y-6">
        {/* Informações sobre SSL */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Configurações Avançadas
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-lg border border-[var(--on-background)]">
              <div>
                <p className="font-medium text-[var(--foreground)]">SSL Habilitado</p>
                <p className="text-sm text-[var(--on-background)]">Certificado de segurança automático</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-[var(--secondary)] font-medium">Ativo</span>
              </div>
            </div>
            
            <div className="p-4 bg-[var(--secondary)]/10 rounded-lg border border-[var(--secondary)]">
              <h3 className="font-medium text-[var(--foreground)] mb-2">Como configurar domínio personalizado:</h3>
              <ol className="text-sm text-[var(--on-background)] space-y-1">
                <li>1. Acesse o painel do seu provedor de domínio</li>
                <li>2. Configure o DNS apontando para nossos servidores</li>
                <li>3. Aguarde a propagação (até 24 horas)</li>
                <li>4. Seu domínio estará ativo automaticamente</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Conteúdo da aba Configurações
  const configTabContent = (
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

  // Configuração das abas
  const tabItems = [
    {
      id: 'domain',
      label: 'Domínio',
      icon: Globe,
      content: domainTabContent
    },
    {
      id: 'config',
      label: 'Configurações',
      icon: Settings,
      content: configTabContent
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho Minimalista */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Loja          
        </h1>
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            Salvar {activeTab === 'domain' ? 'Domínio' : 'Configurações'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    </div>
  );
}