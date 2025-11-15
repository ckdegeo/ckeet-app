'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  DollarSign, 
  Shield, 
  Zap, 
  Users,
  TrendingUp,
  Star,
  Play,
  ChevronRight,
  Store,
  LayoutDashboard,
  Package,
  CreditCard,
  MessageCircle,
  X
} from 'lucide-react';
import Button from '@/app/components/buttons/button';
import TestimonialsSection from '@/app/components/sections/testimonialsSection';
import LoadingSpinner from '@/app/components/ui/loadingSpinner';
import LandingNavbar from '@/app/components/patterns/landingNavbar';
import LandingFooter from '@/app/components/patterns/landingFooter';
import HeroSection from '@/app/components/sections/heroSection';
import DashboardMockupSection from '@/app/components/sections/dashboardMockupSection';
import FeaturesSection from '@/app/components/sections/featuresSection';
import StatsSection from '@/app/components/sections/statsSection';
import ProvidersSection from '@/app/components/sections/providersSection';
import PricingSection from '@/app/components/sections/pricingSection';

const RESERVED_SUBDOMAINS = [
  'www', 'api', 'app', 'admin', 'dashboard', 'seller', 'customer', 
  'master', 'auth', 'login', 'register', 'shop', 'store', 'payment',
  'checkout', 'support', 'help', 'docs', 'blog', 'mail', 'email',
  'ftp', 'static', 'cdn', 'assets', 'files', 'upload', 'download', 'ckeet'
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isCheckingDomain, setIsCheckingDomain] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const router = useRouter();

  // Verificar se é um domínio de loja e redirecionar
  useEffect(() => {
    const checkStoreDomain = () => {
      try {
        const hostname = window.location.hostname;
        console.log('🔍 Verificando hostname:', hostname);
        
        // Extrair subdomínio (primeira parte antes do primeiro ponto)
        const parts = hostname.split('.');
        const subdomain = parts[0];
        
        console.log('📍 Subdomínio detectado:', subdomain);
        console.log('📍 Partes do hostname:', parts);
        
        // Condições para NÃO ser uma loja:
        const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
        const isReserved = RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
        const isMainDomain = parts.length < 2 || subdomain === 'ckeet' || hostname === 'ckeet.store';
        
        console.log('🔎 Verificações:', {
          isLocalhost,
          isReserved,
          isMainDomain,
          hasSubdomain: parts.length >= 2
        });
        
        // Se NÃO for localhost, NÃO for reservado e TEM subdomínio válido = É LOJA
        const isStoreDomain = !isLocalhost && !isReserved && !isMainDomain && parts.length >= 2;
        
        console.log('🏪 É domínio de loja?', isStoreDomain);
        
        if (isStoreDomain) {
          console.log('🔀 Redirecionando para /shop...');
          router.push('/shop');
          return;
        }
        
        console.log('✅ É domínio principal, mostrando landing page');
        setIsCheckingDomain(false);
      } catch (error) {
        console.error('❌ Erro ao verificar domínio:', error);
        setIsCheckingDomain(false);
      }
    };

    checkStoreDomain();
  }, [router]);

  // Configurar scroll suave
  useEffect(() => {
    // Aplicar scroll suave no HTML
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      // Limpar ao desmontar
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Fechar modal com tecla ESC e prevenir scroll do body
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVideoModalOpen) {
        setIsVideoModalOpen(false);
      }
    };

    if (isVideoModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVideoModalOpen]);

  // Mostrar loading enquanto verifica
  if (isCheckingDomain) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-center">
          <LoadingSpinner size="medium" />
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    // Redirecionar para registro
    window.location.href = '/seller/auth/register';
  };

  const handleWatchDemo = () => {
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email subscrito:', email);
    setEmail('');
  };

  const handleSelectPlan = (planName: string) => {
    console.log('Plano selecionado:', planName);
    handleGetStarted();
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Ajuste para navbar fixa
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Schema.org JSON-LD para SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ckeet",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL",
      "description": "Plataforma gratuita com taxa de 3.49% + R$ 0,50 por venda"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Crie sua loja virtual em minutos com Ckeet. Venda produtos digitais sem mensalidade, apenas 3.49% + R$ 0,50 por venda. Integração com PIX via Mercado Pago.",
    "operatingSystem": "Web",
    "url": "https://ckeet.store",
    "screenshot": "https://ckeet.store/img_lp.png",
    "featureList": [
      "Criação de loja virtual em minutos",
      "Sem mensalidade",
      "Integração com PIX via Mercado Pago",
      "Gestão de produtos digitais",
      "Dashboard completo",
      "Domínio personalizado"
    ],
    "author": {
      "@type": "Organization",
      "name": "Ckeet"
    }
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ckeet",
    "url": "https://ckeet.store",
    "logo": "https://ckeet.store/logo.png",
    "description": "Plataforma para criação e gestão de lojas virtuais de produtos digitais",
    "sameAs": [
      "https://www.instagram.com/ckeet",
      "https://twitter.com/ckeet"
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* Navbar */}
      <LandingNavbar 
        onLoginClick={() => window.location.href = '/seller/auth/login'}
        onGetStartedClick={handleGetStarted}
      />

      {/* Conteúdo da Landing Page */}
      <main className="overflow-x-hidden w-full max-w-full">
        {/* Hero Section */}
        <HeroSection
          onGetStarted={handleGetStarted}
          onWatchDemo={handleWatchDemo}
        />

        {/* Dashboard Mockup Section */}
        <DashboardMockupSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Stats Section */}
        <StatsSection />

        {/* Animated Divider - Faixa com elementos flutuantes */}
        <div className="relative w-full py-8 md:py-12 overflow-hidden" style={{ zIndex: 20 }}>
          {/* Faixa principal */}
          <motion.div
            className="relative h-1 w-full"
            style={{
              background: `linear-gradient(to right, transparent, var(--primary) 20%, var(--primary) 80%, transparent)`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            {/* Brilho central */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{
                backgroundColor: 'var(--primary)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </motion.div>

          {/* Elementos flutuantes */}
          {/* Círculo 1 - Esquerda */}
          <motion.div
            className="absolute top-1/2 left-[15%] -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--primary)',
              opacity: 0.6
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.6 }}
            viewport={{ once: true }}
            animate={{
              y: [0, -15, 0],
              x: [0, 10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2
            }}
          />

          {/* Círculo 2 - Centro esquerda */}
          <motion.div
            className="absolute top-1/2 left-[35%] -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              backgroundColor: 'var(--primary)',
              opacity: 0.5
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.5 }}
            viewport={{ once: true }}
            animate={{
              y: [0, -20, 0],
              x: [0, -8, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.4
            }}
          />

          {/* Círculo central - Principal */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
            style={{
              backgroundColor: 'var(--primary)',
              boxShadow: '0 0 20px rgba(189, 37, 60, 0.6)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            animate={{
              scale: [1, 1.4, 1],
              boxShadow: [
                '0 0 20px rgba(189, 37, 60, 0.6)',
                '0 0 40px rgba(189, 37, 60, 0.8)',
                '0 0 20px rgba(189, 37, 60, 0.6)'
              ]
            }}
            transition={{
              scale: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
              },
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }
            }}
          />

          {/* Círculo 3 - Centro direita */}
          <motion.div
            className="absolute top-1/2 left-[65%] -translate-y-1/2 w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: 'var(--primary)',
              opacity: 0.5
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.5 }}
            viewport={{ once: true }}
            animate={{
              y: [0, 18, 0],
              x: [0, 8, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.6
            }}
          />

          {/* Círculo 4 - Direita */}
          <motion.div
            className="absolute top-1/2 left-[85%] -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--primary)',
              opacity: 0.6
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.6 }}
            viewport={{ once: true }}
            animate={{
              y: [0, -12, 0],
              x: [0, -10, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.8
            }}
          />

          {/* Partículas pequenas */}
          {[
            { pos: 10, yOffset: -8, duration: 3.2 },
            { pos: 25, yOffset: 12, duration: 4.1 },
            { pos: 50, yOffset: -5, duration: 3.8 },
            { pos: 75, yOffset: 9, duration: 4.3 },
            { pos: 90, yOffset: -10, duration: 3.5 },
            { pos: 40, yOffset: 7, duration: 4.0 }
          ].map((particle, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
              style={{
                left: `${particle.pos}%`,
                backgroundColor: 'var(--primary)',
                opacity: 0.4
              }}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.4 }}
              viewport={{ once: true }}
              animate={{
                y: [0, particle.yOffset, 0],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3
              }}
            />
          ))}
        </div>

        {/* Providers Section */}
        <ProvidersSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* Outras seções serão adicionadas aqui */}
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
} 