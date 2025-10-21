'use client';

import { useState } from 'react';
import ShopProductCard from '@/app/components/products/shopProductCard';
import { Product } from '@/lib/types';

// Interface local para compatibilidade com dados existentes
interface ProductDisplay {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  stock: number;
}

// Interface para a categoria
interface Category {
  id: string;
  name: string;
  products: Product[];
}

// Dados de exemplo
const sampleCategories: Category[] = [
  {
    id: '1',
    name: 'Eletrônicos',
    products: [
      {
        id: '101',
        title: 'Smartphone XYZ',
        price: 1299.90,
        imageUrl: '/product1.gif',
        stock: 15
      },
      {
        id: '102',
        title: 'Fone de Ouvido Bluetooth',
        price: 199.90,
        imageUrl: '/product2.webp',
        stock: 5
      },
      {
        id: '103',
        title: 'Smartwatch',
        price: 499.90,
        imageUrl: '/product1.gif',
        stock: 0
      },
      {
        id: '104',
        title: 'Tablet Android',
        price: 899.90,
        imageUrl: '/product2.webp',
        stock: 8
      }
    ]
  },
  {
    id: '2',
    name: 'Roupas',
    products: [
      {
        id: '201',
        title: 'Camiseta Básica',
        price: 49.90,
        imageUrl: '/product2.webp',
        stock: 25
      },
      {
        id: '202',
        title: 'Calça Jeans',
        price: 129.90,
        imageUrl: '/product1.gif',
        stock: 8
      },
      {
        id: '203',
        title: 'Jaqueta de Couro',
        price: 299.90,
        imageUrl: '/product2.webp',
        stock: 3
      },
      {
        id: '204',
        title: 'Tênis Esportivo',
        price: 179.90,
        imageUrl: '/product1.gif',
        stock: 12
      },
      {
        id: '205',
        title: 'Boné Trucker',
        price: 39.90,
        imageUrl: '/product2.webp',
        stock: 20
      }
    ]
  },
  {
    id: '3',
    name: 'Casa e Decoração',
    products: [
      {
        id: '301',
        title: 'Vaso Decorativo',
        price: 89.90,
        imageUrl: '/product1.gif',
        stock: 6
      },
      {
        id: '302',
        title: 'Luminária LED',
        price: 159.90,
        imageUrl: '/product2.webp',
        stock: 4
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
                title={product.title}
                price={product.price}
                imageUrl={product.imageUrl}
                stock={product.stock}
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