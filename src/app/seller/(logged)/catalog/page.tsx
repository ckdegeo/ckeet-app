'use client';

import { useState } from 'react';
import CatalogCategorySection from '@/app/components/categories/CatalogCategorySection';
import Selector from '@/app/components/selectors/selector';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import { AlertCircle } from 'lucide-react';
import CatalogFeeNoticeModal from '@/app/components/modals/catalogFeeNoticeModal';

interface CatalogProductDisplay {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  order: number;
}

export default function CatalogPage() {
  const [niche, setNiche] = useState('all');
  const [showNotice, setShowNotice] = useState(false);
  // Placeholder de exemplo (substitua pela sua fonte de dados)
  const exampleSections: { id: string; name: string; products: CatalogProductDisplay[] }[] = [
    { id: 'cat-1', name: 'Destaques', products: [
      { id: 'p-1', name: 'Netflix Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-2', name: 'Spotify Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-3', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-4', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] },
    { id: 'cat-2', name: 'Produtos Populares', products: [
      { id: 'p-5', name: 'Assinatura Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-6', name: 'Assinatura Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-7', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-8', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] },
    { id: 'cat-3', name: 'Produtos Recentes', products: [
      { id: 'p-9', name: 'Assinatura Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-10', name: 'Assinatura Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-11', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-12', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] },
    { id: 'cat-4', name: 'Produtos em Promoção', products: [
      { id: 'p-13', name: 'Assinatura Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-14', name: 'Assinatura Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-15', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-16', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] },
    { id: 'cat-5', name: 'Produtos em Promoção', products: [
      { id: 'p-17', name: 'Assinatura Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-18', name: 'Assinatura Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-19', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-20', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] },
    { id: 'cat-6', name: 'Produtos em Promoção', products: [
      { id: 'p-21', name: 'Assinatura Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-22', name: 'Assinatura Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-23', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-24', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] },
    { id: 'cat-7', name: 'Produtos em Promoção', products: [    
      { id: 'p-25', name: 'Assinatura Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-26', name: 'Assinatura Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-27', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-28', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] },
    { id: 'cat-8', name: 'Produtos em Promoção', products: [
      { id: 'p-29', name: 'Assinatura Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-30', name: 'Assinatura Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-31', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-32', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] },
    { id: 'cat-9', name: 'Produtos em Promoção', products: [
      { id: 'p-33', name: 'Assinatura Premium 1 mês', price: 19.9, imageUrl: '/product-image.png', order: 0 },
      { id: 'p-34', name: 'Assinatura Família 1 mês', price: 14.9, imageUrl: '/product-image.png', order: 1 },
      { id: 'p-35', name: 'VPN Ilimitada 30 dias', price: 12.5, imageUrl: '/product-image.png', order: 2 },
      { id: 'p-36', name: 'E-book Guia de Vendas', price: 29.9, imageUrl: '/product-image.png', order: 3 },
    ] }
  ];

  const handleImport = (sourceProductId: string) => {
    // Substitua pela chamada real de importação
    console.log('Importar produto do catálogo:', sourceProductId);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Catálogo
          </h1>
          <div className="flex items-center gap-2 w-full sm:w-64 justify-end">
            {/* Botão de aviso com pulso */}
            <div className="relative">
              <span
                className="cursor-pointer absolute inset-0 rounded-full bg-[var(--primary)] opacity-30 animate-ping"
                onClick={() => setShowNotice(true)}
              ></span>
              <IconOnlyButton
                icon={AlertCircle}
                onClick={() => setShowNotice(true)}
                variant="surface"
                className="w-10 h-10 z-[1] "
                aria-label="Aviso de taxa do catálogo"
              />
            </div>
            <Selector
              value={niche}
              onChange={setNiche}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'cheats', label: 'Cheats' },
                { value: 'accounts', label: 'Contas' },
                { value: 'softwares', label: 'Softwares' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Seções do catálogo */}
      <div className="flex flex-col gap-6">
        {exampleSections.map((section) => (
          <CatalogCategorySection
            key={section.id}
            id={section.id}
            name={section.name}
            products={section.products}
            onImport={handleImport}
          />
        ))}
      </div>

      {/* Modal de aviso da taxa do catálogo */}
      <CatalogFeeNoticeModal isOpen={showNotice} onClose={() => setShowNotice(false)} />
    </div>
  );
}