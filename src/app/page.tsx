'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';
import Button from '@/app/components/buttons/button';
import Input from '@/app/components/inputs/input';
import NumberCard from '@/app/components/cards/numberCard';
import ValueCard from '@/app/components/cards/valueCard';
import PricingSection from '@/app/components/sections/pricingSection';
import TestimonialsSection from '@/app/components/sections/testimonialsSection';

const RESERVED_SUBDOMAINS = [
  'www', 'api', 'app', 'admin', 'dashboard', 'seller', 'customer', 
  'master', 'auth', 'login', 'register', 'shop', 'store', 'payment',
  'checkout', 'support', 'help', 'docs', 'blog', 'mail', 'email',
  'ftp', 'static', 'cdn', 'assets', 'files', 'upload', 'download', 'ckeet'
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isCheckingDomain, setIsCheckingDomain] = useState(true);
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

  // Mostrar loading enquanto verifica
  if (isCheckingDomain) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--on-background)]">Verificando domínio...</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    // Redirecionar para registro
    window.location.href = '/seller/auth/register';
  };

  const handleWatchDemo = () => {
    // Abrir demo em modal ou página
    console.log('Assistir demo');
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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header/Navbar */}
      <nav className="border-b border-[var(--on-background)]/10 bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Ckeet Logo"
                width={140}
                height={40}
                className="h-auto"
                priority
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">
                Recursos
              </a>
              <a href="#pricing" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">
                Preços
              </a>
              <a href="#testimonials" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">
                Depoimentos
              </a>
              <Button 
                onClick={handleGetStarted}
                className="px-4 py-2 text-sm"
              >
                Começar agora
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-6">
              Venda produtos digitais
              <span className="text-[var(--primary)]"> com sua lojinha virtual dinamica</span>
            </h1>
            <p className="text-xl text-[var(--on-background)] mb-8 max-w-3xl mx-auto">
              Crie sua loja virtual, gerencie produtos, processe pagamentos e acompanhe suas vendas 
              em uma plataforma completa e fácil de usar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                className="px-8 py-4 text-lg"
              >
                Começar gratuitamente
                <ArrowRight size={20} />
              </Button>
              <button 
                onClick={handleWatchDemo}
                className="flex items-center gap-2 px-6 py-4 text-[var(--on-background)] hover:text-[var(--primary)] transition-colors"
              >
                <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                  <Play size={16} className="text-[var(--primary)] ml-0.5" />
                </div>
                Assistir demo
              </button>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-[var(--secondary)]/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <NumberCard
              title="Lojas ativas"
              value={1250}
              icon={Users}
              change={12}
              changeType="increase"
            />
            <ValueCard
              title="Volume processado"
              value={2500000}
              currency="BRL"
              icon={DollarSign}
              change={18}
              changeType="increase"
            />
            <NumberCard
              title="Vendas mensais"
              value={15680}
              icon={TrendingUp}
              change={25}
              changeType="increase"
            />
            <NumberCard
              title="Satisfação"
              value="98%"
              icon={Star}
              changeType="neutral"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--foreground)] mb-4">
              Tudo que você precisa para vender online
            </h2>
            <p className="text-xl text-[var(--on-background)] max-w-2xl mx-auto">
              Uma plataforma completa com todas as ferramentas necessárias para criar e gerenciar sua loja virtual
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Setup Rápido",
                description: "Configure sua loja em minutos com nosso processo simplificado"
              },
              {
                icon: Shield,
                title: "Pagamentos Seguros",
                description: "PIX, cartão de crédito e débito com máxima segurança"
              },
              {
                icon: TrendingUp,
                title: "Analytics Avançado",
                description: "Acompanhe suas vendas e performance em tempo real"
              },
              {
                icon: Users,
                title: "Gestão de Clientes",
                description: "Mantenha relacionamento próximo com seus compradores"
              },
              {
                icon: DollarSign,
                title: "Controle Financeiro",
                description: "Gerencie receitas, comissões e saques de forma simples"
              },
              {
                icon: CheckCircle,
                title: "Suporte 24/7",
                description: "Equipe especializada sempre pronta para te ajudar"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-[var(--background)] border border-[var(--on-background)]/10 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--on-background)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection onSelectPlan={handleSelectPlan} />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-20 bg-[var(--primary)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--on-primary)] mb-4">
              Pronto para começar a vender online?
            </h2>
            <p className="text-xl text-[var(--on-primary)]/90 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de empreendedores que já transformaram seus negócios com nossa plataforma
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                className="px-8 py-4 text-lg bg-[var(--on-primary)] text-[var(--primary)] hover:opacity-90"
              >
                Criar conta gratuita
                <ArrowRight size={20} />
              </Button>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm w-full">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[var(--on-primary)] border-transparent text-[var(--primary)]"
                />
                <Button 
                  type="submit"
                  className="px-6 bg-[var(--on-primary)] text-[var(--primary)] hover:opacity-90 whitespace-nowrap"
                >
                  Receber novidades
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-[var(--on-primary)]/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-[var(--on-primary)]/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--surface)] border-t border-[var(--on-background)]/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.png"
                  alt="Ckeet Logo"
                  width={140}
                  height={40}
                  className="h-auto"
                  priority
                />
              </div>
              <p className="text-[var(--on-background)] mb-4">
                A plataforma completa para sua loja virtual
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Recursos</a></li>
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Preços</a></li>
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Documentação</a></li>
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Sobre</a></li>
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Blog</a></li>
                <li><a href="#" className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors">Carreiras</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[var(--on-background)]/10 mt-8 pt-8 text-center">
            <p className="text-[var(--on-background)]">
              © 2025 Ckeet. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
