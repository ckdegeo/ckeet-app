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
  ChevronRight,
  Store,
  LayoutDashboard,
  Package,
  CreditCard
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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header/Navbar - Modern SaaS Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--on-background)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Ckeet"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-sm font-medium text-[var(--on-background)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Recursos
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-sm font-medium text-[var(--on-background)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Preços
              </button>
              <button 
                onClick={() => scrollToSection('showcase')}
                className="text-sm font-medium text-[var(--on-background)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Exemplos
              </button>
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="text-sm font-medium text-[var(--on-background)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                Depoimentos
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={() => router.push('/seller/auth/login')}
                className="cursor-pointer text-sm font-medium text-[var(--on-background)] hover:text-[var(--primary)] transition-colors px-4 py-2"
              >
                Entrar
              </button>
              <Button 
                onClick={handleGetStarted}
                className="px-6 py-2 text-sm font-medium shadow-lg rounded-full"
              >
                Começar grátis
                <ArrowRight size={16} />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <Button 
                onClick={handleGetStarted}
                className="px-4 py-2 text-sm rounded-full"
              >
                Começar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>

      {/* Hero Headline Section */}
      <section className="relative overflow-hidden py-12 lg:py-20 bg-gradient-to-b from-[var(--background)] via-[var(--surface)] to-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Conteúdo à esquerda */}
            <div className="space-y-8 animate-fade-in-up order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                <Zap size={16} className="text-[var(--primary)]" />
                <span className="text-sm font-medium text-[var(--primary)]">
                  Sua loja virtual em minutos
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--foreground)] leading-tight">
                Sua{' '}
                <span className="text-[var(--primary)] relative inline-block">
                  lojinha virtual
                  <span className="absolute -bottom-2 left-0 right-0 h-2 bg-[var(--primary)]/20 -z-10"></span>
                </span>
                <br />
                em minutos
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-[var(--on-background)] leading-relaxed">
                Crie, personalize e venda produtos digitais com sua própria loja virtual. 
                Sem conhecimento técnico. Sem complicação. Sem mensalidades.
              </p>

              {/* Key Benefits */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-[var(--on-background)]">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  <span>Setup em 5 minutos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--on-background)]">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  <span>Sem mensalidade</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--on-background)]">
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  <span>PIX integrado</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleGetStarted}
                  className="px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all rounded-full"
                >
                  Criar minha loja grátis
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <button 
                  onClick={handleWatchDemo}
                  className="cursor-pointer flex items-center gap-2 px-6 py-4 text-[var(--on-background)] hover:text-[var(--primary)] transition-colors border border-[var(--on-background)]/20 rounded-full hover:border-[var(--primary)]/30 bg-[var(--surface)] hover:bg-[var(--surface)]"
                >
                  <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                    <Play size={16} className="text-[var(--primary)] ml-0.5" />
                  </div>
                  Ver demonstração
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 text-sm text-[var(--on-background)] pt-4">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                </div>
                <span className="font-medium">4.9/5 de +500 lojas</span>
              </div>
            </div>

            {/* Imagem à direita */}
            <div className="relative animate-fade-in-up order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden">
                <img 
                  src="/img_lp.png" 
                  alt="Ckeet - Plataforma de vendas digitais" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-[var(--secondary)]/5 rounded-full blur-3xl animate-blob-delay"></div>
        </div>
      </section>

      {/* Styled Divider */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent h-px"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-[var(--primary)]/30"></div>
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
            <div className="h-px flex-1 max-w-md bg-gradient-to-r from-[var(--primary)]/30 via-[var(--primary)]/50 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Easy Creation Section */}
      <section id="features" className="py-12 lg:py-12 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">
                100% Gratuito
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-tight">
              Crie sua loja em{' '}
              <span className="text-[var(--primary)] relative inline-block">
                4 passos simples
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[var(--primary)]/20 -z-10"></span>
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[var(--on-background)] max-w-3xl mx-auto leading-relaxed">
              <strong className="text-[var(--primary)]">É completamente GRÁTIS!</strong> Você só paga uma pequena taxa quando vender algo. 
              Sem mensalidades, sem taxas ocultas, sem pegadinhas.
            </p>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
              
              {/* Step 1 */}
              <div className="text-center space-y-4 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--on-background)]/10 hover:border-[var(--primary)]/20 transition-all duration-300">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-[var(--primary)]">1</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  Cadastre-se
                </h3>
                <p className="text-[var(--on-background)] leading-relaxed">
                  Crie sua conta em segundos. Apenas email e senha. Sem documentos, sem burocracia.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--on-background)]/10 hover:border-[var(--primary)]/20 transition-all duration-300">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-[var(--primary)]">2</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  Crie seu domínio personalizado
                </h3>
                <p className="text-[var(--on-background)] leading-relaxed">
                  Escolha um domínio único para sua loja. Exemplo: minhaloja.ckeet.store
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--on-background)]/10 hover:border-[var(--primary)]/20 transition-all duration-300">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-[var(--primary)]">3</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  Personalize sua loja
                </h3>
                <p className="text-[var(--on-background)] leading-relaxed">
                  Escolha o nome, cores e identidade visual da sua loja. Interface intuitiva, sem complicação.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center space-y-4 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--on-background)]/10 hover:border-[var(--primary)]/20 transition-all duration-300">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-[var(--primary)]">4</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">
                  Comece a vender
                </h3>
                <p className="text-[var(--on-background)] leading-relaxed">
                  Adicione seus produtos e comece a receber pagamentos via PIX instantaneamente.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-8 justify-center">
              <div className="flex justify-center">
                <Button 
                  onClick={handleGetStarted}
                  className="px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all rounded-full"
                >
                  Criar minha loja grátis agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styled Divider */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent h-px"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-[var(--primary)]/30"></div>
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
            <div className="h-px flex-1 max-w-md bg-gradient-to-r from-[var(--primary)]/30 via-[var(--primary)]/50 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* System Showcase Section */}
      <section id="showcase" className="py-12 lg:py-12 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <Store size={16} className="text-[var(--primary)]" />
              <span className="text-sm font-medium text-[var(--primary)]">
                Sistema em ação
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-tight">
              Veja como{' '}
              <span className="text-[var(--primary)] relative inline-block">
                funciona na prática
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[var(--primary)]/20 -z-10"></span>
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[var(--on-background)] max-w-3xl mx-auto leading-relaxed">
              Interface intuitiva, dashboard completo e processo de venda simplificado. 
              Tudo que você precisa para vender online em um só lugar.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Dashboard Card */}
            <div className="group">
              <div className="bg-white rounded-2xl border border-[var(--on-background)]/10 p-6 hover:shadow-lg transition-all duration-300 min-h-[250px] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                  <LayoutDashboard className="text-[var(--primary)]" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--on-background)] mb-2">
                  Dashboard completo
                </h3>
                <p className="text-[var(--on-background)]/60">
                  Acompanhe faturamento bruto, líquido, quantidade de vendas e ordens em tempo real com gráficos interativos.
                </p>
              </div>
            </div>

            {/* Produtos Card */}
            <div className="group">
              <div className="bg-white rounded-2xl border border-[var(--on-background)]/10 p-6 hover:shadow-lg transition-all duration-300 min-h-[250px] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[var(--secondary)]/10 flex items-center justify-center mb-4">
                  <Package className="text-[var(--secondary)]" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--on-background)] mb-2">
                  Gerencie seus produtos
                </h3>
                <p className="text-[var(--on-background)]/60">
                  Crie e gerencie produtos, categorias, estoque e entregáveis com categorização e filtros avançados.
                </p>
              </div>
            </div>

            {/* Vendas Card */}
            <div className="group">
              <div className="bg-white rounded-2xl border border-[var(--on-background)]/10 p-6 hover:shadow-lg transition-all duration-300 min-h-[250px] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--on-background)] mb-2">
                  Gerencie suas vendas
                </h3>
                <p className="text-[var(--on-background)]/60">
                  Visualize todas as vendas, status de pagamento, detalhes de clientes e conteúdo entregue.
                </p>
              </div>
            </div>

            {/* Clientes Card */}
            <div className="group">
              <div className="bg-white rounded-2xl border border-[var(--on-background)]/10 p-6 hover:shadow-lg transition-all duration-300 min-h-[250px] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--on-background)] mb-2">
                  Gerencie seus clientes
                </h3>
                <p className="text-[var(--on-background)]/60">
                  Liste, filtre e gerencie seus clientes, com opção de banir ou reativar contas quando necessário.
                </p>
              </div>
            </div>

            {/* Loja Card */}
            <div className="group">
              <div className="bg-white rounded-2xl border border-[var(--on-background)]/10 p-6 hover:shadow-lg transition-all duration-300 min-h-[250px] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                  <Store className="text-violet-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--on-background)] mb-2">
                  Personalize sua loja
                </h3>
                <p className="text-[var(--on-background)]/60">
                  Configure nome, URL personalizada, cores, logo e domínio da sua loja virtual.
                </p>
              </div>
            </div>

            {/* Integrações Card */}
            <div className="group">
              <div className="bg-white rounded-2xl border border-[var(--on-background)]/10 p-6 hover:shadow-lg transition-all duration-300 min-h-[250px] flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <CreditCard className="text-orange-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--on-background)] mb-2">
                  Integração com Mercado Pago
                </h3>
                <p className="text-[var(--on-background)]/60">
                  Configure pagamentos via PIX, receba notificações automáticas e gerencie suas credenciais.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16 flex justify-center">
            <Button
              onClick={handleGetStarted}
              className="bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-variant)] px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Comece a vender agora
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>

          {/* Divider */}
          <div className="mt-16 mb-16">
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--on-background)]/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Pricing/Payment Section */}
      <section className="py-12 lg:py-12 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Text Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                <DollarSign size={16} className="text-[var(--primary)]" />
                <span className="text-sm font-medium text-[var(--primary)]">
                  Pague apenas quando vender
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-tight">
                Transparência{' '}
                <span className="text-[var(--primary)] relative inline-block">
                  nas taxas
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[var(--primary)]/20 -z-10"></span>
                </span>
              </h2>

              {/* Subheadline */}
              <p className="text-lg text-[var(--on-background)] leading-relaxed">
                Sem mensalidades, sem taxas ocultas, sem pegadinhas. Você só paga uma pequena taxa por venda bem-sucedida.
              </p>

              {/* Mercado Pago Mention */}
              <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--on-background)]/10">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-[var(--background)] rounded-lg flex items-center justify-center p-2">
                    <Image
                      src="/mercado-pago.png"
                      alt="Mercado Pago"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Processamento via Mercado Pago
                    </p>
                    <p className="text-xs text-[var(--on-background)]/60">
                      Pagamentos seguros e instantâneos via PIX
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-[var(--on-background)]">Sem mensalidade. Ever.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-[var(--on-background)]">Taxa única e transparente por venda</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-[var(--on-background)]">Integração com Mercado Pago</span>
                </li>
              </ul>
            </div>

            {/* Right Side - Pricing Card */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[var(--primary)]/10 via-[var(--secondary)]/5 to-[var(--primary)]/10 rounded-3xl border-2 border-[var(--primary)]/20 p-8 shadow-xl">
                
                {/* Large Price Display */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-[var(--primary)]">5.99</span>
                    <span className="text-2xl text-[var(--on-background)]/60">%</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-3xl font-bold text-[var(--primary)]">+</span>
                    <span className="text-3xl font-bold text-[var(--primary)]">R$ 0,50</span>
                  </div>
                  <p className="text-sm text-[var(--on-background)]/60 mt-2">por venda</p>
                </div>

                {/* Example Calculation */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-[var(--primary)]/10">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                    Cálculo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--on-background)]">Produto vendido:</span>
                      <span className="font-semibold text-[var(--foreground)]">R$ 100,00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--on-background)]/60">Taxa (5.99%):</span>
                      <span className="text-[var(--on-background)]/60">R$ 5,99</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--on-background)]/60">Taxa fixa:</span>
                      <span className="text-[var(--on-background)]/60">R$ 0,50</span>
                    </div>
                    <div className="h-px bg-[var(--primary)]/20 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--on-background)] font-semibold">Você recebe:</span>
                      <span className="font-bold text-xl text-[var(--primary)]">R$ 93,51</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handleGetStarted}
                  className="w-full mt-6 bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-variant)] py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Comece a vender agora
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--primary)]/5 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--secondary)]/5 rounded-full blur-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Styled Divider */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent h-px"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-[var(--primary)]/30"></div>
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full"></div>
            <div className="h-px flex-1 max-w-md bg-gradient-to-r from-[var(--primary)]/30 via-[var(--primary)]/50 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Features Section - Using PricingSection Component */}
      <section id="pricing">
        <PricingSection onSelectPlan={handleSelectPlan} />
      </section>

      {/* Testimonials Section - Using TestimonialsSection Component */}
      <section id="testimonials">
        <TestimonialsSection />
      </section>

      {/* Divider */}
      <div className="mt-16 mb-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--on-background)]/20 to-transparent"></div>
      </div>

      {/* Footer */}
      <footer className="bg-[var(--surface)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Ckeet"
                width={100}
                height={28}
                className="h-7 w-auto"
              />
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-立方5 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-[var(--on-background)] hover:text-[var(--primary)] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-[var(--on-background)]/10">
            <p className="text-center text-sm text-[var(--on-background)]/60">
              © 2024 Ckeet. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}