'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Input from '@/app/components/inputs/input';
import ImageUpload from '@/app/components/images/imageUpload';
import ColorPicker from '@/app/components/inputs/colorPicker';
import PercentageInput from '@/app/components/inputs/percentageInput';
import Button from '@/app/components/buttons/button';
import DomainModal from '@/app/components/modals/domainModal';
import { Save, Settings, Store as StoreIcon, Palette, Image, Globe, Square, Circle, MousePointer } from 'lucide-react';
import SwitchButton from '@/app/components/buttons/switchButton';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
import { getAccessToken } from '@/lib/utils/authUtils';
import { useStoreConfigCache } from '@/lib/hooks/useCache';
import StoreSkeleton from '@/app/components/store/storeSkeleton';
import Tabs from '@/app/components/tabs/tabs';
import Selector from '@/app/components/selectors/selector';

// Interface para os dados da loja
interface StoreConfig {
  storeName: string;
  contactEmail: string;
  logoUrl: string;
  homeBannerUrl: string;
  storeBannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  showStoreName: boolean;
  // Links de redes sociais (frontend apenas)
  discord?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  telegram?: string;
  threads?: string;
}

// Interface para dados do domínio
interface DomainConfig {
  subdomain: string;
}

// Interface para configurações de aparência
interface BackgroundImageConfig {
  enabled: boolean;
  url: string;
  // Opacidade de 0 a 100 (percentual) para facilitar controle na UI
  opacity: number;
}

interface ComponentStyle {
  rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  hasBorder: boolean;
  borderColor: string;
  backgroundColor?: string;
  titleColor?: string;
  priceColor?: string;
}

interface BannerConfig extends ComponentStyle {
  hoverEffect: 'none' | 'scale' | 'brightness' | 'opacity' | 'shadow';
  hoverEnabled: boolean;
  redirectUrl: string;
  redirectEnabled: boolean;
}

interface AppearanceConfig {
  buttons: ComponentStyle;
  productCards: ComponentStyle;
  banner: BannerConfig;
  storeBackground: string;
  backgroundImage: BackgroundImageConfig;
  categoryTitle: {
    titleColor: string;
    lineColor: string;
  };
}

function StorePageContent() {
  const searchParams = useSearchParams();
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s: any = storeData.store;
      setStoreConfig({
        storeName: storeData.store.name || '',
        contactEmail: storeData.store.contactEmail || '',
        logoUrl: storeData.store.logoUrl || '',
        homeBannerUrl: storeData.store.homeBannerUrl || '',
        storeBannerUrl: storeData.store.storeBannerUrl || '',
        primaryColor: storeData.store.primaryColor || '#bd253c',
        secondaryColor: storeData.store.secondaryColor || '#970b27',
        showStoreName: s?.showStoreName !== undefined ? s.showStoreName : true,
        // Campos sociais
        discord: s?.discordUrl || '',
        youtube: s?.youtubeUrl || '',
        instagram: s?.instagramUrl || '',
        twitter: s?.twitterUrl || '',
        telegram: s?.telegramUrl || '',
        threads: s?.threadsUrl || ''
      });

      // Define ativação inicial com base no campo "enabled" do banco
      setSocialEnabled({
        discord: s?.discordEnabled || false,
        youtube: s?.youtubeEnabled || false,
        instagram: s?.instagramEnabled || false,
        twitter: s?.twitterEnabled || false,
        telegram: s?.telegramEnabled || false,
        threads: s?.threadsEnabled || false,
      });

      // Carregar configurações de aparência do banco
      if (s?.appearanceConfig) {
        const loadedConfig = s.appearanceConfig as AppearanceConfig;
        // Garantir que categoryTitle sempre exista
        setAppearanceConfig({
          ...loadedConfig,
          // Garantir que backgroundImage sempre exista
          backgroundImage: loadedConfig.backgroundImage || {
            enabled: false,
            url: '',
            opacity: 100,
          },
          categoryTitle: loadedConfig.categoryTitle || {
            titleColor: '#111827',
            lineColor: '#bd253c',
          },
          // Garantir que productCards tenha os novos campos
          productCards: {
            ...loadedConfig.productCards,
            backgroundColor: loadedConfig.productCards?.backgroundColor || '#ffffff',
            titleColor: loadedConfig.productCards?.titleColor || '#111827',
            priceColor: loadedConfig.productCards?.priceColor || '#111827',
          },
        });
      }
    }
  }, [storeData]);
  
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    storeName: '',
    contactEmail: '',
    logoUrl: '',
    homeBannerUrl: '',
    storeBannerUrl: '',
    primaryColor: '#bd253c',
    secondaryColor: '#970b27',
    showStoreName: true,
    discord: '',
    youtube: '',
    instagram: '',
    twitter: '',
    telegram: '',
    threads: ''
  });

  // Estado de ativação de redes sociais (apenas UI)
  const [socialEnabled, setSocialEnabled] = useState<Record<string, boolean>>({
    discord: false,
    youtube: false,
    instagram: false,
    twitter: false,
    telegram: false,
    threads: false,
  });

  const [domainConfig, setDomainConfig] = useState<DomainConfig>({
    subdomain: ''
  });

  // Estado para configurações de aparência
  const [appearanceConfig, setAppearanceConfig] = useState<AppearanceConfig>({
    buttons: {
      rounded: 'full',
      hasBorder: false,
      borderColor: '#000000',
    },
    productCards: {
      rounded: '2xl',
      hasBorder: true,
      borderColor: '#e5e7eb',
      backgroundColor: '#ffffff',
      titleColor: '#111827',
      priceColor: '#111827',
    },
    banner: {
      rounded: '2xl',
      hasBorder: false,
      borderColor: '#000000',
      hoverEffect: 'none',
      hoverEnabled: false,
      redirectUrl: '',
      redirectEnabled: false,
    },
    storeBackground: '#f9fafb', // gray-50
    backgroundImage: {
      enabled: false,
      url: '',
      opacity: 100,
    },
    categoryTitle: {
      titleColor: '#111827',
      lineColor: '#bd253c',
    },
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
        // showStoreName é boolean, não precisa de trim
        if (field === 'showStoreName') {
          return false; // showStoreName não é obrigatório para validação
        }
        // Para strings, verificar se está vazio
        return !value || (typeof value === 'string' && value.trim() === '');
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
                showStoreName: storeConfig.showStoreName,
                appearanceConfig: appearanceConfig,
                // Social Media (opcional)
                discordUrl: storeConfig.discord,
                discordEnabled: socialEnabled.discord,
                youtubeUrl: storeConfig.youtube,
                youtubeEnabled: socialEnabled.youtube,
                instagramUrl: storeConfig.instagram,
                instagramEnabled: socialEnabled.instagram,
                twitterUrl: storeConfig.twitter,
                twitterEnabled: socialEnabled.twitter,
                telegramUrl: storeConfig.telegram,
                telegramEnabled: socialEnabled.telegram,
                threadsUrl: storeConfig.threads,
                threadsEnabled: socialEnabled.threads,
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
      
      // Disparar evento customizado para atualizar o status de completude no sidebar
      window.dispatchEvent(new CustomEvent('store-config-saved'));

            } catch (error) {
              showErrorToast(error instanceof Error ? error.message : 'Erro ao salvar configurações');
            }
  };

  const handleDomainSave = (config: DomainConfig) => {
    setDomainConfig(config);
    // Implementar lógica de salvamento do domínio
  };


  // Conteúdo obrigatório (acima do divider)
  const requiredContent = (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <StoreIcon size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Informações básicas
          </h2> 
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Visibilidade do Nome da Loja */}
          <div className="p-4 border border-[var(--on-background)] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Exibir nome da loja na navbar</p>
                <p className="text-xs text-[var(--on-background)]">Ative para exibir o nome da loja na navbar</p>
              </div>
              <SwitchButton
                value={storeConfig.showStoreName}
                onChange={(v) => setStoreConfig(prev => ({ ...prev, showStoreName: v }))}
                size="md"
              />
            </div>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Seção de Imagens */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Image size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Imagens
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Logotipo da Loja */}
          <div className="p-5 border border-[var(--on-background)] rounded-xl bg-[var(--background)]/40 hover:bg-[var(--background)]/60 transition-colors">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                Logotipo da loja
              </h3>
              <p className="text-xs text-[var(--on-background)]">
                Imagem quadrada recomendada. Máximo 5MB
              </p>
            </div>
            <ImageUpload
              label=""
              value={storeConfig.logoUrl ? { url: storeConfig.logoUrl } : null}
              onChange={(file, url) => {
                if (file && url) {
                  setStoreConfig(prev => ({ ...prev, logoUrl: url }));
                } else if (file === null) {
                  setStoreConfig(prev => ({ ...prev, logoUrl: '' }));
                }
              }}
              placeholder="Arraste seu logotipo aqui ou clique para selecionar"
              maxSize={5}
              error=""
              folder="logos"
            />
          </div>

          {/* Banner da Tela Inicial */}
          <div className="p-5 border border-[var(--on-background)] rounded-xl bg-[var(--background)]/40 hover:bg-[var(--background)]/60 transition-colors">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                Banner da tela inicial
              </h3>
              <p className="text-xs text-[var(--on-background)]">
                Banner exibido nas páginas de login e registro. Máximo 10MB
              </p>
            </div>
            <ImageUpload
              label=""
              value={storeConfig.homeBannerUrl ? { url: storeConfig.homeBannerUrl } : null}
              onChange={(file, url) => {
                if (file && url) {
                  setStoreConfig(prev => ({ ...prev, homeBannerUrl: url }));
                } else if (file === null) {
                  setStoreConfig(prev => ({ ...prev, homeBannerUrl: '' }));
                }
              }}
              placeholder="Arraste o banner da tela inicial aqui"
              maxSize={10}
              error=""
              folder="home-banner"
            />
          </div>

          {/* Banner da Loja */}
          <div className="p-5 border border-[var(--on-background)] rounded-xl bg-[var(--background)]/40 hover:bg-[var(--background)]/60 transition-colors">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                Banner da loja
              </h3>
              <p className="text-xs text-[var(--on-background)]">
                Banner principal exibido na página da loja. Máximo 10MB
              </p>
            </div>
            <ImageUpload
              label=""
              value={storeConfig.storeBannerUrl ? { url: storeConfig.storeBannerUrl } : null}
              onChange={(file, url) => {
                if (file && url) {
                  setStoreConfig(prev => ({ ...prev, storeBannerUrl: url }));
                } else if (file === null) {
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
    </div>
  );

  // Opções de arredondamento (para botões e banner)
  const roundedOptions = [
    { value: 'none', label: 'Sem arredondamento' },
    { value: 'sm', label: 'Pequeno (sm)' },
    { value: 'md', label: 'Médio (md)' },
    { value: 'lg', label: 'Grande (lg)' },
    { value: 'xl', label: 'Extra Grande (xl)' },
    { value: '2xl', label: '2x Grande (2xl)' },
    { value: 'full', label: 'Completo (full)' },
  ];

  // Opções de arredondamento para cards de produtos (sem "full")
  const roundedOptionsForCards = [
    { value: 'none', label: 'Sem arredondamento' },
    { value: 'sm', label: 'Pequeno (sm)' },
    { value: 'md', label: 'Médio (md)' },
    { value: 'lg', label: 'Grande (lg)' },
    { value: 'xl', label: 'Extra Grande (xl)' },
    { value: '2xl', label: '2x Grande (2xl)' },
  ];

  // Função para atualizar estilo de componente
  const updateComponentStyle = (
    component: 'buttons' | 'productCards' | 'banner',
    field: keyof ComponentStyle | keyof BannerConfig,
    value: string | boolean
  ) => {
    setAppearanceConfig(prev => ({
      ...prev,
      [component]: {
        ...prev[component],
        [field]: value,
      },
    }));
  };

  // Conteúdo da Tab Aparência
  const appearanceContent = (
    <div className="space-y-6">
      {/* Background da Loja */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Square size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Background da loja
          </h2>
        </div>
        
        <div className="space-y-4">
          <ColorPicker
            label="Cor de fundo"
            value={appearanceConfig.storeBackground}
            onChange={(color) => setAppearanceConfig(prev => ({ ...prev, storeBackground: color }))}
          />

          <div className="p-4 border border-[var(--on-background)] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Imagem de fundo</p>
                <p className="text-xs text-[var(--on-background)]">Ative para exibir uma imagem no background</p>
              </div>
              <SwitchButton
                value={appearanceConfig.backgroundImage.enabled}
                onChange={(v) =>
                  setAppearanceConfig(prev => ({
                    ...prev,
                    backgroundImage: { ...prev.backgroundImage, enabled: v },
                  }))
                }
                size="md"
              />
            </div>

            {appearanceConfig.backgroundImage.enabled && (
              <div className="pt-2 border-t border-[var(--on-background)]/20 space-y-4">
                <ImageUpload
                  label=""
                  value={appearanceConfig.backgroundImage.url ? { url: appearanceConfig.backgroundImage.url } : null}
                  onChange={(_, url) =>
                    setAppearanceConfig(prev => ({
                      ...prev,
                      backgroundImage: { ...prev.backgroundImage, url: url || '' },
                    }))
                  }
                  placeholder="Arraste a imagem de fundo aqui"
                  maxSize={10}
                  error=""
                  folder="store-background"
                />
                <PercentageInput
                  label="Opacidade da imagem"
                  value={appearanceConfig.backgroundImage.opacity}
                  onChange={(value) =>
                    setAppearanceConfig(prev => ({
                      ...prev,
                      backgroundImage: { ...prev.backgroundImage, opacity: value },
                    }))
                  }
                  placeholder="0 a 100"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner da Loja */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Image size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Banner da loja
          </h2>
        </div>
        
        <div className="space-y-4">
          <Selector
            label="Arredondamento"
            options={roundedOptions}
            value={appearanceConfig.banner.rounded}
            onChange={(value) => updateComponentStyle('banner', 'rounded', value)}
          />
          
          <div className="p-4 border border-[var(--on-background)] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Borda</p>
                <p className="text-xs text-[var(--on-background)]">Ative para exibir borda no banner</p>
              </div>
              <SwitchButton
                value={appearanceConfig.banner.hasBorder}
                onChange={(v) => updateComponentStyle('banner', 'hasBorder', v)}
                size="md"
              />
            </div>

            {appearanceConfig.banner.hasBorder && (
              <div className="pt-2 border-t border-[var(--on-background)]/20">
                <ColorPicker
                  label="Cor da borda"
                  value={appearanceConfig.banner.borderColor}
                  onChange={(color) => updateComponentStyle('banner', 'borderColor', color)}
                />
              </div>
            )}
          </div>

          {/* Efeito Hover */}
          <div className="p-4 border border-[var(--on-background)] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Efeito hover</p>
                <p className="text-xs text-[var(--on-background)]">Ative para exibir efeito ao passar o mouse</p>
              </div>
              <SwitchButton
                value={appearanceConfig.banner.hoverEnabled}
                onChange={(v) => updateComponentStyle('banner', 'hoverEnabled', v)}
                size="md"
              />
            </div>

            {appearanceConfig.banner.hoverEnabled && (
              <div className="pt-2 border-t border-[var(--on-background)]/20">
                <Selector
                  label="Tipo de efeito hover"
                  options={[
                    { value: 'none', label: 'Nenhum' },
                    { value: 'scale', label: 'Aumentar (Scale)' },
                    { value: 'brightness', label: 'Brilho (Brightness)' },
                    { value: 'opacity', label: 'Opacidade' },
                    { value: 'shadow', label: 'Sombra (Shadow)' },
                  ]}
                  value={appearanceConfig.banner.hoverEffect}
                  onChange={(value) => updateComponentStyle('banner', 'hoverEffect', value)}
                />
              </div>
            )}
          </div>

          {/* Redirect Link */}
          <div className="p-4 border border-[var(--on-background)] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Link de redirecionamento</p>
                <p className="text-xs text-[var(--on-background)]">Ative para redirecionar ao clicar no banner</p>
              </div>
              <SwitchButton
                value={appearanceConfig.banner.redirectEnabled}
                onChange={(v) => updateComponentStyle('banner', 'redirectEnabled', v)}
                size="md"
              />
            </div>

            {appearanceConfig.banner.redirectEnabled && (
              <div className="pt-2 border-t border-[var(--on-background)]/20">
                <Input
                  label="URL de redirecionamento"
                  placeholder="https://exemplo.com"
                  value={appearanceConfig.banner.redirectUrl}
                  onChange={(e) => updateComponentStyle('banner', 'redirectUrl', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões da Loja */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MousePointer size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Botões da loja
          </h2>
        </div>
        
        <div className="space-y-4">
          <Selector
            label="Arredondamento"
            options={roundedOptions}
            value={appearanceConfig.buttons.rounded}
            onChange={(value) => updateComponentStyle('buttons', 'rounded', value)}
          />
          
          <div className="p-4 border border-[var(--on-background)] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Borda</p>
                <p className="text-xs text-[var(--on-background)]">Ative para exibir borda nos botões</p>
              </div>
              <SwitchButton
                value={appearanceConfig.buttons.hasBorder}
                onChange={(v) => updateComponentStyle('buttons', 'hasBorder', v)}
                size="md"
              />
            </div>

            {appearanceConfig.buttons.hasBorder && (
              <div className="pt-2 border-t border-[var(--on-background)]/20">
                <ColorPicker
                  label="Cor da borda"
                  value={appearanceConfig.buttons.borderColor}
                  onChange={(color) => updateComponentStyle('buttons', 'borderColor', color)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Produtos */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Square size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Cards de produtos
          </h2>
        </div>
        
        <div className="space-y-4">
          <Selector
            label="Arredondamento"
            options={roundedOptionsForCards}
            value={appearanceConfig.productCards.rounded}
            onChange={(value) => updateComponentStyle('productCards', 'rounded', value)}
          />
          
          <div className="p-4 border border-[var(--on-background)] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Borda</p>
                <p className="text-xs text-[var(--on-background)]">Ative para exibir borda nos cards</p>
              </div>
              <SwitchButton
                value={appearanceConfig.productCards.hasBorder}
                onChange={(v) => updateComponentStyle('productCards', 'hasBorder', v)}
                size="md"
              />
            </div>

            {appearanceConfig.productCards.hasBorder && (
              <div className="pt-2 border-t border-[var(--on-background)]/20">
                <ColorPicker
                  label="Cor da borda"
                  value={appearanceConfig.productCards.borderColor}
                  onChange={(color) => updateComponentStyle('productCards', 'borderColor', color)}
                />
              </div>
            )}
          </div>

          {/* Cor do Card */}
          <div className="p-4 border border-[var(--on-background)] rounded-xl space-y-4">
            <ColorPicker
              label="Cor de fundo do card"
              value={appearanceConfig.productCards.backgroundColor || '#ffffff'}
              onChange={(color) => updateComponentStyle('productCards', 'backgroundColor', color)}
            />
          </div>

          {/* Cores das Fontes */}
          <div className="p-4 border border-[var(--on-background)] rounded-xl space-y-4">
            <div className="space-y-4">
              <ColorPicker
                label="Cor da fonte do título"
                value={appearanceConfig.productCards.titleColor || '#111827'}
                onChange={(color) => updateComponentStyle('productCards', 'titleColor', color)}
              />
              <ColorPicker
                label="Cor da fonte do preço"
                value={appearanceConfig.productCards.priceColor || '#111827'}
                onChange={(color) => updateComponentStyle('productCards', 'priceColor', color)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Título da Categoria */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Square size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Título da categoria
          </h2>
        </div>
        
        <div className="space-y-4">
          <ColorPicker
            label="Cor da fonte do título"
            value={appearanceConfig.categoryTitle.titleColor}
            onChange={(color) => setAppearanceConfig(prev => ({
              ...prev,
              categoryTitle: {
                ...prev.categoryTitle,
                titleColor: color,
              },
            }))}
          />
          <ColorPicker
            label="Cor da linha decorativa"
            value={appearanceConfig.categoryTitle.lineColor}
            onChange={(color) => setAppearanceConfig(prev => ({
              ...prev,
              categoryTitle: {
                ...prev.categoryTitle,
                lineColor: color,
              },
            }))}
          />
        </div>
      </div>
    </div>
  );

  // Conteúdo da Tab Social
  const socialContent = (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] border border-[var(--on-background)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} className="text-[var(--primary)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Social <span className="text-sm text-[var(--secondary)]"> (Opcional)</span>
          </h2>
        </div>

        {/* Grade bonita com cartões e switch por item */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'discord', label: 'Discord', placeholder: 'URL do Discord' },
            { key: 'youtube', label: 'YouTube', placeholder: 'URL do YouTube' },
            { key: 'instagram', label: 'Instagram', placeholder: 'URL do Instagram' },
            { key: 'twitter', label: 'Twitter', placeholder: 'URL do Twitter (X)' },
            { key: 'telegram', label: 'Telegram', placeholder: 'URL do Telegram' },
            { key: 'threads', label: 'Threads', placeholder: 'URL do Threads' },
          ].map((item) => (
            <div
              key={item.key}
              className="relative p-4 border border-[var(--on-background)] rounded-xl bg-[var(--background)]/40 hover:bg-[var(--background)]/60 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                  <p className="text-xs text-[var(--on-background)]">Ative para exibir na loja</p>
                </div>
                <SwitchButton
                  value={socialEnabled[item.key]}
                  onChange={(v) => setSocialEnabled((prev) => ({ ...prev, [item.key]: v }))}
                  size="md"
                />
              </div>

               <Input
                placeholder={item.placeholder}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(storeConfig as any)[item.key] || ''}
                onChange={handleInputChange(item.key as keyof StoreConfig)}
                disabled={!socialEnabled[item.key]}
                className={!socialEnabled[item.key] ? 'opacity-60' : ''}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  // Mostrar loading se estiver carregando
  if (storeLoading) {
    return <StoreSkeleton />;
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

      {/* Conteúdo Obrigatório */}
      {requiredContent}

      {/* Tabs Opcionais */}
      <Tabs
        items={[
          {
            id: 'appearance',
            label: 'Aparência',
            icon: Palette,
            content: appearanceContent,
          },
          {
            id: 'social',
            label: 'Social',
            icon: Globe,
            content: socialContent,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

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