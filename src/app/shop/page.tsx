'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, Category, Product } from '@/lib/types';
import StoreNavbar from './patterns/storeNavbar';
import Footer from './patterns/footer';
import { useCustomerLogout } from '@/lib/hooks/useCustomerLogout';
import LoadingSpinner from '@/app/components/ui/loadingSpinner';
import SocialLinks from '@/app/components/social/socialLinks';

// Interface para configurações de aparência
interface AppearanceConfig {
  buttons: {
    rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    hasBorder: boolean;
    borderColor: string;
  };
  productCards: {
    rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    hasBorder: boolean;
    borderColor: string;
    backgroundColor?: string;
    titleColor?: string;
    priceColor?: string;
  };
  banner: {
    rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    hasBorder: boolean;
    borderColor: string;
    hoverEffect: 'none' | 'scale' | 'brightness' | 'opacity' | 'shadow';
    hoverEnabled: boolean;
    redirectUrl: string;
    redirectEnabled: boolean;
  };
  storeBackground: string;
  backgroundImage?: {
    enabled: boolean;
    url: string;
    opacity: number; // 0-100
  };
  categoryTitle: {
    titleColor: string;
    lineColor: string;
  };
}

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<(Category & { products: Product[] })[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>();
  const [appearanceConfig, setAppearanceConfig] = useState<AppearanceConfig | null>(null);
  const { logout } = useCustomerLogout();

  useEffect(() => {
    fetchStoreData();
    checkAuthentication();
    
    // Verificar autenticação periodicamente para detectar mudanças
    const interval = setInterval(checkAuthentication, 1000);
    
    return () => clearInterval(interval);
  }, []);

  async function fetchStoreData() {
    try {
      // Buscar dados da loja pelo subdomínio
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      const response = await fetch(`/api/storefront/store?subdomain=${subdomain}`);
      
      if (!response.ok) {
        throw new Error('Loja não encontrada');
      }

      const data = await response.json();
      setStore(data.store);
      setCategories(data.categories);
      
      // Carregar configurações de aparência
      if (data.store?.appearanceConfig) {
        setAppearanceConfig(data.store.appearanceConfig as AppearanceConfig);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  function checkAuthentication() {
    // Verificar se há token de customer no localStorage
    const accessToken = localStorage.getItem('customer_access_token');
    const userData = localStorage.getItem('customer_user_data');
    
    if (accessToken && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUserName(user.name);
      } catch (error) {
        setIsAuthenticated(false);
        setUserName(undefined);
      }
    } else {
      setIsAuthenticated(false);
      setUserName(undefined);
    }
  }

  const handleLoginClick = () => {
    // Redirecionar para página de login do customer
    window.location.href = '/shop/auth/login';
  };

  const handleRegisterClick = () => {
    // Redirecionar para página de registro do customer
    window.location.href = '/shop/auth/register';
  };



  const handleProductClick = (productId: string) => {
    if (!isAuthenticated) {
      // Se não estiver logado, redirecionar para login
      window.location.href = '/shop/auth/login';
      return;
    }
    
    // Se estiver logado, ir para a página do produto
    window.location.href = `/shop/${productId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loja não encontrada</h1>
          <p className="text-gray-600">O domínio solicitado não está configurado.</p>
        </div>
      </div>
    );
  }

  // Função auxiliar para obter classes de arredondamento
  const getRoundedClass = (rounded: string) => {
    const roundedMap: Record<string, string> = {
      'none': 'rounded-none',
      'sm': 'rounded-sm',
      'md': 'rounded-md',
      'lg': 'rounded-lg',
      'xl': 'rounded-xl',
      '2xl': 'rounded-2xl',
      'full': 'rounded-full',
    };
    return roundedMap[rounded] || 'rounded-2xl';
  };

  // Função auxiliar para obter classes de hover
  const getHoverClass = (hoverEffect: string) => {
    const hoverMap: Record<string, string> = {
      'none': '',
      'scale': 'hover:scale-105',
      'brightness': 'hover:brightness-110',
      'opacity': 'hover:opacity-90',
      'shadow': 'hover:shadow-xl',
    };
    return hoverMap[hoverEffect] || '';
  };

  // Configurações padrão se não houver configuração
  const defaultAppearance: AppearanceConfig = {
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
    storeBackground: '#f9fafb',
    backgroundImage: {
      enabled: false,
      url: '',
      opacity: 100,
    },
    categoryTitle: {
      titleColor: '#111827',
      lineColor: '#bd253c',
    },
  };

  const appearance = appearanceConfig || defaultAppearance;

  const bgImageEnabled = !!appearance.backgroundImage?.enabled && !!appearance.backgroundImage?.url;
  const bgOpacity = (appearance.backgroundImage?.opacity ?? 100) / 100;

  return (
    <div 
      className="min-h-screen relative"
      style={{ backgroundColor: appearance.storeBackground }}
    >
      {bgImageEnabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: `url('${appearance.backgroundImage?.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: bgOpacity,
          }}
        />
      )}
      {/* Navbar Moderna */}
      <StoreNavbar
        store={{
          ...store,
          name: (store.showStoreName !== false) ? store.name : '',
          showStoreName: store.showStoreName,
        }}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />

      {/* Banner da Loja (se existir) */}
      {store.storeBannerUrl && (
        <div className="container mx-auto px-8 py-6">
          <div 
            className={`w-full h-72 overflow-hidden relative shadow-lg cursor-pointer transition-all duration-300 ${
              getRoundedClass(appearance.banner.rounded)
            } ${
              appearance.banner.hasBorder ? 'border' : ''
            } ${
              appearance.banner.hoverEnabled ? getHoverClass(appearance.banner.hoverEffect) : ''
            }`}
            style={{
              borderColor: appearance.banner.hasBorder ? appearance.banner.borderColor : 'transparent',
            }}
            onClick={() => {
              if (appearance.banner.redirectEnabled && appearance.banner.redirectUrl) {
                window.open(appearance.banner.redirectUrl, '_blank');
              }
            }}
          >
            <img
              src={store.storeBannerUrl}
              alt="Banner da loja"
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent ${getRoundedClass(appearance.banner.rounded)}`}></div>
          </div>
        </div>
      )}

      {/* Redes Sociais */}
      <div className="container mx-auto px-8 py-4 flex justify-center">
        <SocialLinks
          socials={{
            discordUrl: store.discordUrl,
            discordEnabled: store.discordEnabled,
            youtubeUrl: store.youtubeUrl,
            youtubeEnabled: store.youtubeEnabled,
            instagramUrl: store.instagramUrl,
            instagramEnabled: store.instagramEnabled,
            twitterUrl: store.twitterUrl,
            twitterEnabled: store.twitterEnabled,
            telegramUrl: store.telegramUrl,
            telegramEnabled: store.telegramEnabled,
            threadsUrl: store.threadsUrl,
            threadsEnabled: store.threadsEnabled,
          }}
          primaryColor={store.primaryColor}
          secondaryColor={store.secondaryColor}
        />
      </div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-8 py-8">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum produto disponível</h3>
              <p className="text-gray-600">Estamos preparando produtos incríveis para você. Volte em breve!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => (
              <section key={category.id} className="scroll-mt-20">
                {/* Nome da Categoria com linha decorativa */}
                <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 min-w-0 w-full overflow-hidden">
                  <h2 
                    className="text-xl sm:text-2xl md:text-3xl font-bold truncate min-w-0"
                    style={{ color: appearance.categoryTitle.titleColor || store.primaryColor || '#bd253c' }}
                    title={category.name}
                  >
                    {category.name}
                  </h2>
                  {/* Divider decorativo - oculto em mobile, visível em desktop */}
                  <div 
                    className="hidden sm:block h-1 rounded-full flex-1 min-w-[60px]"
                    style={{ 
                      backgroundColor: `${appearance.categoryTitle.lineColor || store.primaryColor || '#bd253c'}20`,
                    }}
                  ></div>
                </div>

                {/* Grid de Produtos Moderno */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {category.products
                    .filter(product => product.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className={`group shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1 cursor-pointer ${
                          getRoundedClass(appearance.productCards.rounded)
                        } ${
                          appearance.productCards.hasBorder ? 'border' : 'border border-gray-100'
                        } hover:border-transparent`}
                        style={{
                          backgroundColor: appearance.productCards.backgroundColor || '#ffffff',
                          borderColor: appearance.productCards.hasBorder 
                            ? appearance.productCards.borderColor 
                            : undefined,
                        }}
                      >
                        {/* Imagem do Produto */}
                        {product.imageUrl ? (
                          <div className="aspect-square overflow-hidden bg-gray-50 relative">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}

                        {/* Conteúdo */}
                        <div className="p-3">
                          <h3 
                            className="text-base font-medium mb-1.5 line-clamp-2 group-hover:opacity-80 transition-colors"
                            style={{ color: appearance.productCards.titleColor || '#111827' }}
                          >
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span 
                              className="text-lg font-bold"
                              style={{ color: appearance.productCards.priceColor || store.primaryColor || '#bd253c' }}
                            >
                              R$ {product.price.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1">
                              {(() => {
                                // Se for estoque por linha, mostrar quantidade de linhas disponíveis
                                if (product.stockType === 'LINE') {
                                  const linesCount = product.stockLines?.filter(line => !line.isUsed).length || 0;
                                  return (
                                    <span className={`
                                      px-2 py-1 rounded-full text-xs font-medium
                                      ${linesCount > 10 
                                        ? 'bg-green-100 text-green-800' 
                                        : linesCount > 0 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-red-100 text-red-800'
                                      }
                                    `}>
                                      {linesCount} em estoque
                                    </span>
                                  );
                                }
                                
                                // Se for estoque fixo, mostrar badge "FIXO"
                                if (product.stockType === 'FIXED') {
                                  return (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      FIXO
                                    </span>
                                  );
                                }
                                
                                // Se for KeyAuth, mostrar badge "KEYAUTH"
                                if (product.stockType === 'KEYAUTH') {
                                  return (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      KEYAUTH
                                    </span>
                                  );
                                }
                                
                                // Fallback para compatibilidade com dados antigos - mostrar estoque real
                                const stock = (product as Product & { stock?: number }).stock || 0;
                                return (
                                  <span className={`
                                    px-2 py-1 rounded-full text-xs font-medium
                                    ${stock > 10 
                                      ? 'bg-green-100 text-green-800' 
                                      : stock > 0 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                    }
                                  `}>
                                    {stock} em estoque
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        <hr 
                          className="my-6 rounded-full mt-2 mb-2" 
                          style={{ 
                            borderColor: appearance.productCards.hasBorder 
                              ? appearance.productCards.borderColor 
                              : '#e5e7eb'
                          }}
                        />
                        
                        {/* Ações */}
                        <div className="flex items-center justify-end gap-2 p-3 pt-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Evitar que o clique no botão acione o clique no card
                              handleProductClick(product.id);
                            }}
                            className={`cursor-pointer flex items-center justify-center gap-2 px-6 py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90 ${
                              getRoundedClass(appearance.buttons.rounded)
                            } ${
                              appearance.buttons.hasBorder ? 'border' : ''
                            }`}
                            style={{ 
                              backgroundColor: store.secondaryColor || '#970b27',
                              borderColor: appearance.buttons.hasBorder ? appearance.buttons.borderColor : 'transparent',
                            }}
                          >
                            Comprar
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer store={store} />
    </div>
  );
}

