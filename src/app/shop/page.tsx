'use client';

import { useEffect, useState } from 'react';
import { Store, Category, Product } from '@/lib/types';

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [categories, setCategories] = useState<(Category & { products: Product[] })[]>([]);

  useEffect(() => {
    fetchStoreData();
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
    <div className="min-h-screen">
      {/* Header com Banner */}
      {store.storeBannerUrl && (
        <div className="w-full h-64 overflow-hidden">
          <img
            src={store.storeBannerUrl}
            alt="Banner da loja"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header com Logo e Nome */}
      <header 
        className="sticky top-0 z-50 border-b"
        style={{ 
          backgroundColor: store.primaryColor || '#6200EE',
          borderBottomColor: store.secondaryColor || '#03DAC6'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
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

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category.id}>
                {/* Nome da Categoria */}
                <h2 
                  className="text-3xl font-bold mb-6"
                  style={{ color: store.primaryColor || '#6200EE' }}
                >
                  {category.name}
                </h2>

                {/* Grid de Produtos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {category.products
                    .filter(product => product.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((product) => (
                      <a
                        key={product.id}
                        href={`/shop/${product.id}`}
                        className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                      >
                        {/* Imagem do Produto */}
                        {product.imageUrl && (
                          <div className="aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* Informações do Produto */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {product.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <span 
                              className="text-2xl font-bold"
                              style={{ color: store.primaryColor || '#6200EE' }}
                            >
                              R$ {product.price.toFixed(2)}
                            </span>
                            <button
                              className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: store.secondaryColor || '#03DAC6' }}
                            >
                              Ver mais
                            </button>
                          </div>
                        </div>
                      </a>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
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

