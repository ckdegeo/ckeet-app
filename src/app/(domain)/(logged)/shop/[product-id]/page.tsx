'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Heart, ArrowLeft, Play, Package } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import PaymentModal from '@/app/components/modals/paymentModal';

// Interface para o produto
interface ProductDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  videoUrl?: string;
  images: string[];
  isFavorite?: boolean;
}

// Dados de exemplo - normalmente viria de uma API
const getProductById = (id: string): ProductDetails => {
  const products: Record<string, ProductDetails> = {
    '101': {
      id: '101',
      title: 'Smartphone XYZ Premium',
      description: 'Um smartphone revolucionário com tecnologia de ponta. Tela AMOLED de 6.7 polegadas, câmera tripla de 108MP, processador octa-core de última geração e bateria de longa duração. Perfeito para quem busca performance e qualidade em um só dispositivo.',
      price: 1299.90,
      stock: 15,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      images: [
        '/product1.gif',
        '/product2.webp',
        '/product1.gif',
        '/product2.webp'
      ]
    },
    '102': {
      id: '102',
      title: 'Fone de Ouvido Bluetooth Pro',
      description: 'Experimente a liberdade do som sem fio com nosso fone Bluetooth premium. Cancelamento ativo de ruído, 30 horas de bateria, drivers de alta fidelidade e design ergonômico para máximo conforto durante longas sessões de uso.',
      price: 199.90,
      stock: 5,
      images: [
        '/product2.webp',
        '/product1.gif',
        '/product2.webp'
      ]
    }
  };

  return products[id] || {
    id: 'not-found',
    title: 'Produto não encontrado',
    description: 'Este produto não está disponível.',
    price: 0,
    stock: 0,
    images: []
  };
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params['product-id'] as string;
  
  const [product, setProduct] = useState<ProductDetails>(getProductById(productId));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite || false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handlePurchase = async () => {
    if (product.stock === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => {
    // Aqui seria a lógica de confirmação de pagamento
    console.log('Pagamento confirmado para:', product.title);
    alert('Pagamento confirmado! Você receberá o produto por e-mail.');
    setShowPaymentModal(false);
    router.push('/orders');
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setProduct(prev => ({ ...prev, isFavorite: !isFavorite }));
  };

  const handleBack = () => {
    router.back();
  };

  const isOutOfStock = product.stock === 0;

  if (product.id === 'not-found') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Botão Voltar */}
        <div className="mb-8">
          <IconOnlyButton
            icon={ArrowLeft}
            onClick={handleBack}
            variant="surface"
          />
        </div>

        {/* Estado de Produto Não Encontrado */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            {/* Ícone */}
            <div className="flex justify-center">
              <div className="bg-[var(--surface)] border border-[var(--on-background)]/20 rounded-2xl p-6">
                <Package 
                  size={48} 
                  className="text-[var(--on-background)]" 
                />
              </div>
            </div>
            
            {/* Texto */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Produto não encontrado
              </h1>
              <p className="text-[var(--on-background)] max-w-sm mx-auto">
                O produto que você está procurando não existe ou foi removido
              </p>
            </div>

            {/* Botão */}
            <div className="pt-4">
              <Button 
                onClick={handleBack}
                className="px-8"
              >
                Voltar à loja
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Botão Voltar */}
      <div>
        <IconOnlyButton
          icon={ArrowLeft}
          onClick={handleBack}
          variant="surface"
          className="mb-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seção de Mídia */}
        <div className="space-y-4">
          {/* Imagem/Vídeo Principal */}
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
            {isVideoPlaying && product.videoUrl ? (
              <iframe
                src={product.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.videoUrl && (
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                  >
                    <div className="bg-white/90 rounded-full p-4">
                      <Play size={32} className="text-[var(--primary)] ml-1" />
                    </div>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Thumbnails - Vídeo + Imagens */}
          <div className="grid grid-cols-4 gap-2">
            {/* Thumbnail do Vídeo (se existir) */}
            {product.videoUrl && (
              <button
                onClick={() => setIsVideoPlaying(true)}
                className={`
                  aspect-square rounded-lg overflow-hidden border-2 transition-all relative
                  ${isVideoPlaying
                    ? 'border-[var(--primary)]' 
                    : 'border-transparent hover:border-[var(--on-background)]'
                  }
                `}
              >
                <img
                  src={product.images[0]}
                  alt="Vídeo do produto"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="bg-white/90 rounded-full p-2">
                    <Play size={16} className="text-[var(--primary)] ml-0.5" />
                  </div>
                </div>
              </button>
            )}
            
            {/* Thumbnails das Imagens */}
            {product.images.slice(0, product.videoUrl ? 3 : 4).map((image, index) => (
              <button
                key={`image-${index}`}
                onClick={() => {
                  setSelectedImageIndex(index);
                  setIsVideoPlaying(false);
                }}
                className={`
                  aspect-square rounded-lg overflow-hidden border-2 transition-all
                  ${selectedImageIndex === index && !isVideoPlaying
                    ? 'border-[var(--primary)]' 
                    : 'border-transparent hover:border-[var(--on-background)]'
                  }
                `}
              >
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Seção de Informações */}
        <div className="space-y-6">
          {/* Cabeçalho do Produto */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                {product.title}
              </h1>
              <IconOnlyButton
                icon={Heart}
                onClick={handleToggleFavorite}
                variant="surface"
                className={`${isFavorite ? 'text-red-500' : ''}`}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-[var(--primary)]">
                {formatCurrency(product.price)}
              </p>
              
              <div className="flex items-center">
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${product.stock > 10 
                    ? 'bg-[var(--secondary)] text-[var(--on-secondary)]' 
                    : product.stock > 0 
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]' 
                    : 'bg-[var(--error)] text-[var(--on-error)]'
                  }
                `}>
                  {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                </span>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Descrição
            </h2>
            <p className="text-[var(--on-background)] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Botão de Compra */}
          <div className="space-y-4">
            <Button
              onClick={handlePurchase}
              disabled={isOutOfStock || isPurchasing}
              className={`
                w-full h-14 flex items-center justify-center gap-3 font-medium
                ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ShoppingCart size={20} />
              <span>
                {isPurchasing 
                  ? 'Processando...' 
                  : isOutOfStock 
                  ? 'Produto Indisponível' 
                  : 'Comprar Agora'
                }
              </span>
            </Button>

            {isOutOfStock && (
              <p className="text-center text-sm text-[var(--error)]">
                Este produto está temporariamente fora de estoque
              </p>
            )}
          </div>

          {/* Informações do Produto */}
          <div className="space-y-4">
            <div className="bg-[var(--surface)] border border-[var(--on-background)]/20 rounded-2xl p-4 space-y-3">
           
              {/* Disponibilidade */}
              <div className="flex items-center justify-between py-2 border-b border-[var(--on-background)]/10 last:border-b-0">
                <span className="text-sm font-medium text-[var(--on-background)]">
                  Disponibilidade
                </span>
                <div className="flex items-center gap-2">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${product.stock > 0 ? 'bg-[var(--secondary)]' : 'bg-[var(--error)]'}
                  `} />
                  <span className={`
                    text-sm font-medium
                    ${product.stock > 0 ? 'text-[var(--secondary)]' : 'text-[var(--error)]'}
                  `}>
                    {product.stock > 0 ? 'Em Estoque' : 'Indisponível'}
                  </span>
                </div>
              </div>

              {/* Quantidade em Estoque */}
              {product.stock > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-[var(--on-background)]/10 last:border-b-0">
                  <span className="text-sm font-medium text-[var(--on-background)]">
                    Quantidade Disponível
                  </span>
                  <span className={`
                    text-sm font-semibold px-3 py-1 rounded-full
                    ${product.stock > 10 
                      ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]' 
                      : product.stock > 5
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'bg-[var(--error)]/10 text-[var(--error)]'
                    }
                  `}>
                    {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'}
                  </span>
                </div>
              )}

              {/* Status de Entrega */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-[var(--on-background)]">
                  Entrega
                </span>
                <span className="text-sm text-[var(--secondary)] font-medium">
                  Imediata após pagamento
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Pagamento */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        productName={product.title}
        productPrice={product.price}
        onPaymentConfirm={handlePaymentConfirm}
      />
    </div>
  );
}