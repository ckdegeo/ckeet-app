'use client';

import { useState } from 'react';
import ShopProductCard from '@/app/components/products/shopProductCard';
import { Product } from '@/lib/types';

// Interface local para compatibilidade com dados existentes
interface ProductDisplay {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

// Interface para a categoria
interface Category {
  id: string;
  name: string;
  products: ProductDisplay[];
}

// Dados de exemplo
const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Eletrônicos',
    products: [
      {
        id: '101',
        name: 'Smartphone XYZ',
        price: 1299.90,
        imageUrl: '/product1.gif',
      },
      {
        id: '102',
        name: 'Fone de Ouvido Bluetooth',
        price: 199.90,
        imageUrl: '/product2.webp',
      },
      {
        id: '103',
        name: 'Smartwatch',
        price: 499.90,
        imageUrl: '/product1.gif',
      },
      {
        id: '104',
        name: 'Tablet Android',
        price: 899.90,
        imageUrl: '/product2.webp',
      }
    ]
  },
  {
    id: '2',
    name: 'Roupas',
    products: [
      {
        id: '201',
        name: 'Camiseta Básica',
        price: 49.90,
        imageUrl: '/product2.webp',
      },
      {
        id: '202',
        name: 'Calça Jeans',
        price: 129.90,
        imageUrl: '/product1.gif',
      },
      {
        id: '203',
        name: 'Jaqueta de Couro',
        price: 299.90,
        imageUrl: '/product2.webp',
      },
      {
        id: '204',
        name: 'Tênis Esportivo',
        price: 179.90,
        imageUrl: '/product1.gif',
      },
      {
        id: '205',
        name: 'Boné Trucker',
        price: 39.90,
        imageUrl: '/product2.webp',
      }
    ]
  },
  {
    id: '3',
    name: 'Casa e Decoração',
    products: [
      {
        id: '301',
        name: 'Vaso Decorativo',
        price: 89.90,
        imageUrl: '/product1.gif',
      },
      {
        id: '302',
        name: 'Luminária LED',
        price: 159.90,
        imageUrl: '/product2.webp',
      }
    ]
  }
];

export default function ShopPage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleAddToCart = (productId: string) => {
    console.log('Adicionar ao carrinho:', productId);
    // Implementar lógica do carrinho
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {sampleCategories.map(category => (
        <div key={category.id} className="space-y-4">
          {/* Título da categoria */}
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {category.name}
          </h2>
          
          {/* Grid de produtos (máximo 5 por categoria) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {category.products.slice(0, 5).map(product => (
              <ShopProductCard
                key={product.id}
                id={product.id}
                title={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(product.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}   