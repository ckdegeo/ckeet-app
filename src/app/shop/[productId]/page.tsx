'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, Headphones, Shield } from 'lucide-react';
import { Store, Product } from '@/lib/types';
import StoreNavbar from '../patterns/storeNavbar';
import Footer from '../patterns/footer';
import PixModal from '@/app/components/modals/pixModal';
import { useCustomerLogout } from '@/lib/hooks/useCustomerLogout';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const { logout } = useCustomerLogout();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>();
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);

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
    window.location.href = '/shop/auth/login';
  };

  const handleRegisterClick = () => {
    window.location.href = '/shop/auth/register';
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
          store={store || { name: 'Loja', primaryColor: '#bd253c', secondaryColor: '#970b27' }}
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
            <button
              onClick={() => router.push('/shop')}
              className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Voltar
            </button>
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
      <main className="container mx-auto px-8 py-8">
        {/* Botão de Voltar */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/shop')}
            className="px-8 py-3 text-md rounded-full transition-all flex items-center gap-2 cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: store.secondaryColor || '#bd253c',
              color: 'white',
              border: `2px solid ${store.secondaryColor || '#bd253c'}`
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div className="space-y-3">
            {/* Imagem/Vídeo Principal */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden relative group">
              {selectedImage === 'video' && product.videoUrl ? (
                <iframe
                  src={product.videoUrl}
                  title={product.name}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image!)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === image
                      ? 'border-current'
                      : 'border-transparent hover:border-gray-300'
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
              
              {/* Miniatura do Vídeo */}
              {product.videoUrl && (
                <button
                  onClick={() => setSelectedImage('video')}
                  className={`aspect-square bg-black/5 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center relative ${
                    selectedImage === 'video'
                      ? 'border-current'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ 
                    borderColor: selectedImage === 'video' ? store.primaryColor : 'transparent' 
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <div className="absolute inset-0 bg-black/30"></div>
                </button>
              )}
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="flex flex-col">
            {/* Header do Produto */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold" style={{ color: store.primaryColor || '#bd253c' }}>
                  R$ {product.price.toFixed(2)}
                </span>
                {(() => {
                  // Se for estoque por linha, mostrar quantidade de linhas disponíveis
                  if (product.stockType === 'LINE') {
                    const linesCount = product.stockLines?.filter(line => !line.isUsed).length || 0;
                    return (
                      <span className={`
                        px-2.5 py-1 rounded-full text-xs font-semibold
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
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        FIXO
                      </span>
                    );
                  }
                  
                  // Se for KeyAuth, mostrar badge "KEYAUTH"
                  if (product.stockType === 'KEYAUTH') {
                    return (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        KEYAUTH
                      </span>
                    );
                  }
                  
                  // Fallback para compatibilidade com dados antigos - mostrar estoque real
                  const stock = (product as Product & { stock?: number }).stock || 0;
                  return (
                    <span className={`
                      px-2.5 py-1 rounded-full text-xs font-semibold
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

            {/* Descrição */}
            {product.description && (
              <div className="py-6 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Sobre o produto
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Vantagens
              </h2>
              <div className="space-y-3">
                {/* Entrega instantânea */}
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Entrega instantânea</h3>
                    <p className="text-sm text-gray-600">Receba seu produto imediatamente após o pagamento</p>
                  </div>
                </div>

                {/* Suporte 24/7 */}
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Suporte 24/7</h3>
                    <p className="text-sm text-gray-600">Nossa equipe está sempre disponível para ajudar</p>
                  </div>
                </div>

                {/* Processado por MercadoPago */}
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mercado Pago</h3>
                    <p className="text-sm text-gray-600">Pagamento seguro e confiável</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Compra */}
            <div className="pt-6">
              <button
                onClick={() => setIsPixModalOpen(true)}
                className="cursor-pointer w-full py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: store.secondaryColor || '#970b27' }}
              >
                Comprar agora
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer store={store} />

      {/* Modal PIX */}
      {product && store && (
        <PixModal
          isOpen={isPixModalOpen}
          onClose={() => setIsPixModalOpen(false)}
          productId={product.id}
          productName={product.name}
          productPrice={product.price}
          productImage={product.imageUrl}
          primaryColor={store.primaryColor}
          secondaryColor={store.secondaryColor}
          onPaymentSuccess={() => {
            setIsPixModalOpen(false);
            router.push('/shop/orders');
          }}
        />
      )}
    </div>
  );
}

