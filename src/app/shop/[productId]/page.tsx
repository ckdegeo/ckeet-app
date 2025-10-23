'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, Product } from '@/lib/types';
import StoreNavbar from '../patterns/storeNavbar';
import Button from '@/app/components/buttons/button';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>();

  useEffect(() => {
    fetchProductData();
    checkAuthentication();
  }, [productId]);

  async function fetchProductData() {
    try {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      const response = await fetch(`/api/storefront/product?subdomain=${subdomain}&productId=${productId}`);
      
      if (!response.ok) {
        throw new Error('Produto não encontrado');
      }

      const data = await response.json();
      setStore(data.store);
      setProduct(data.product);
      setSelectedImage(data.product.imageUrl || '');
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
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
    window.location.href = '/auth/login';
  };

  const handleRegisterClick = () => {
    window.location.href = '/auth/register';
  };

  const handleProfileClick = () => {
    window.location.href = '/customer/profile';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!store || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StoreNavbar
          store={store || { name: 'Loja', primaryColor: '#6200EE', secondaryColor: '#03DAC6' }}
          isAuthenticated={isAuthenticated}
          userName={userName}
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
          onProfileClick={handleProfileClick}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
            <p className="text-gray-600 mb-6">O produto solicitado não está disponível.</p>
            <Button
              onClick={() => router.push('/shop')}
              className="px-6 py-3"
            >
              Voltar para a loja
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = [product.imageUrl, product.image2Url, product.image3Url].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar do Design System */}
      <StoreNavbar
        store={store}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onProfileClick={handleProfileClick}
      />

      {/* Conteúdo do Produto */}
      <main className="container mx-auto px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Galeria de Imagens */}
            <div className="space-y-4">
              {/* Imagem Principal */}
              {selectedImage ? (
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative group">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image!)}
                      className={`aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === image
                          ? 'border-current shadow-md'
                          : 'border-transparent hover:border-gray-200'
                      }`}
                      style={{ 
                        borderColor: selectedImage === image ? store.primaryColor : 'transparent' 
                      }}
                    >
                      <img
                        src={image!}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Vídeo (se disponível) */}
              {product.videoUrl && (
                <div className="aspect-video bg-gray-50 rounded-2xl overflow-hidden">
                  <iframe
                    src={product.videoUrl}
                    title="Vídeo do produto"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center justify-between mb-4">
                  <p 
                    className="text-4xl font-bold"
                    style={{ color: store.primaryColor || '#6200EE' }}
                  >
                    R$ {product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1">
                    {(() => {
                      // Se for estoque por linha, mostrar quantidade de linhas disponíveis
                      if (product.stockType === 'LINE') {
                        const linesCount = product.stockLines?.filter(line => !line.isUsed).length || 0;
                        return (
                          <span className={`
                            px-3 py-1 rounded-full text-sm font-medium
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
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            FIXO
                          </span>
                        );
                      }
                      
                      // Se for KeyAuth, mostrar badge "KEYAUTH"
                      if (product.stockType === 'KEYAUTH') {
                        return (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            KEYAUTH
                          </span>
                        );
                      }
                      
                      // Fallback para compatibilidade com dados antigos - mostrar estoque real
                      const stock = (product as Product & { stock?: number }).stock || 0;
                      return (
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
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

              {product.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Descrição</h2>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Botão de Compra */}
              <Button
                onClick={() => {
                  // TODO: Implementar lógica de carrinho/checkout
                  alert('Funcionalidade de compra em desenvolvimento!');
                }}
                className="w-full py-4 text-lg font-semibold"
                style={{ backgroundColor: store.secondaryColor || '#03DAC6' }}
              >
                Comprar Agora
              </Button>

              {/* Informações Adicionais */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Entrega instantânea</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                      </svg>
                    </div>
                    <span className="font-medium">Suporte 24/7</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="font-medium">Pagamento seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 4.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
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

