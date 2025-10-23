'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Store, Product } from '@/lib/types';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    fetchProductData();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!store || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
          <button
            onClick={() => router.push('/shop')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para a loja
          </button>
        </div>
      </div>
    );
  }

  const images = [product.imageUrl, product.image2Url, product.image3Url].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b"
        style={{ 
          backgroundColor: store.primaryColor || '#6200EE',
          borderBottomColor: store.secondaryColor || '#03DAC6'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/shop')}
              className="text-white hover:opacity-80"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {store.logoUrl && (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-12 w-12 object-contain bg-white rounded-lg p-1"
              />
            )}
            <h1 className="text-2xl font-bold text-white">{store.name}</h1>
          </div>
        </div>
      </header>

      {/* Conteúdo do Produto */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Galeria de Imagens */}
            <div className="space-y-4">
              {/* Imagem Principal */}
              {selectedImage && (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image!)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === image
                          ? 'border-current'
                          : 'border-transparent'
                      }`}
                      style={{ borderColor: selectedImage === image ? store.primaryColor : 'transparent' }}
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
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p 
                  className="text-4xl font-bold"
                  style={{ color: store.primaryColor || '#6200EE' }}
                >
                  R$ {product.price.toFixed(2)}
                </p>
              </div>

              {product.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Descrição</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Botão de Compra */}
              <button
                className="w-full py-4 rounded-lg text-white font-bold text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: store.secondaryColor || '#03DAC6' }}
                onClick={() => {
                  // TODO: Implementar lógica de carrinho/checkout
                  alert('Funcionalidade de compra em desenvolvimento!');
                }}
              >
                Comprar Agora
              </button>

              {/* Informações Adicionais */}
              <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
                <p>✓ Entrega instantânea</p>
                <p>✓ Suporte 24/7</p>
                <p>✓ Pagamento seguro</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="mt-16 py-8 text-white"
        style={{ backgroundColor: store.primaryColor || '#6200EE' }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">&copy; 2024 {store.name}. Todos os direitos reservados.</p>
          <p className="text-sm opacity-80">
            Contato: {store.contactEmail}
          </p>
        </div>
      </footer>
    </div>
  );
}

