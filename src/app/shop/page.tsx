'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, Category, Product } from '@/lib/types';
import StoreNavbar from './patterns/storeNavbar';

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<(Category & { products: Product[] })[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>();

  useEffect(() => {
    fetchStoreData();
    checkAuthentication();
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
    } catch (error) {
      console.error('Erro ao carregar loja:', error);
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
        console.error('Erro ao parsear dados do usuário:', error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }

  const handleLoginClick = () => {
    // Redirecionar para página de login do customer
    window.location.href = '/auth/login';
  };

  const handleRegisterClick = () => {
    // Redirecionar para página de registro do customer
    window.location.href = '/auth/register';
  };

  const handleProfileClick = () => {
    // Redirecionar para página de perfil do customer
    window.location.href = '/customer/profile';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Moderna */}
      <StoreNavbar
        store={store}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onProfileClick={handleProfileClick}
      />

      {/* Banner da Loja (se existir) */}
      {store.storeBannerUrl && (
        <div className="container mx-auto px-8 py-6">
          <div className="w-full h-72 overflow-hidden relative rounded-2xl shadow-lg">
            <img
              src={store.storeBannerUrl}
              alt="Banner da loja"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-8 py-12">
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
                <div className="flex items-center gap-4 mb-8">
                  <h2 
                    className="text-4xl font-bold"
                    style={{ color: store.primaryColor || '#6200EE' }}
                  >
                    {category.name}
                  </h2>
                  <div 
                    className="flex-1 h-1 rounded-full"
                    style={{ backgroundColor: `${store.primaryColor || '#6200EE'}20` }}
                  ></div>
                </div>

                {/* Grid de Produtos Moderno */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.products
                    .filter(product => product.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((product) => (
                      <a
                        key={product.id}
                        href={`/shop/${product.id}`}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-transparent transform hover:-translate-y-1"
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
                        <div className="p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                            {product.name}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span 
                              className="text-xl font-bold"
                              style={{ color: store.primaryColor || '#6200EE' }}
                            >
                              R$ {product.price.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1">
                              {(() => {
                                // Se for estoque por linha, mostrar quantidade de linhas
                                if (product.stockType === 'LINE') {
                                  const linesCount = product.stockLines?.length || 0;
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
                                
                                // Fallback - se não tem stockType definido, não mostrar badge
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Ações */}
                        <div className="flex items-center justify-end gap-2 p-4 pt-0">
                          <button
                            className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90"
                            style={{ backgroundColor: store.secondaryColor || '#03DAC6' }}
                          >
                            Comprar
                          </button>
                        </div>
                      </a>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer Moderno */}
      <footer 
        className="mt-20 py-12 text-white relative overflow-hidden"
        style={{ backgroundColor: store.primaryColor || '#6200EE' }}
      >
        {/* Decoração de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo e Nome */}
            <div className="text-center md:text-left">
              {store.logoUrl && (
                <div className="inline-flex h-12 w-12 bg-white rounded-lg p-2 mb-4">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{store.name}</h3>
              <p className="text-white/80 text-sm">
                Produtos digitais de qualidade para você
              </p>
            </div>

            {/* Links Rápidos */}
            <div className="text-center">
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/shop" className="text-white/80 hover:text-white transition-colors">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/shop#products" className="text-white/80 hover:text-white transition-colors">
                    Produtos
                  </Link>
                </li>
                <li>
                  <Link href="/customer/orders" className="text-white/80 hover:text-white transition-colors">
                    Meus Pedidos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm">
                <p className="text-white/80">
                  <a href={`mailto:${store.contactEmail}`} className="hover:text-white transition-colors">
                    {store.contactEmail}
                  </a>
                </p>
                <div className="flex gap-3 justify-center md:justify-end mt-4">
                  {/* Placeholder para redes sociais futuras */}
                  <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Linha divisória */}
          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-sm text-white/70">
              &copy; {new Date().getFullYear()} {store.name}. Todos os direitos reservados.
            </p>
            <p className="text-xs text-white/50 mt-2">
              Loja criada com ❤️ pela plataforma Ckeet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

