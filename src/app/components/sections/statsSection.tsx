'use client';

import { motion } from 'framer-motion';
import { DollarSign, Store, Users, TrendingUp, ArrowRight, Play, CheckCircle2, Zap, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/app/components/buttons/button';

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
  label: string;
  description: string;
  delay?: number;
}

function StatCard({ icon: Icon, value, label, description, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="flex flex-col h-full min-w-0"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Icon and Value Row */}
      <div className="flex items-center gap-2.5 mb-2">
        {/* Icon Container - Red square */}
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: '#FFFFFF'
          }}
        >
          <Icon size={18} />
        </div>
        {/* Value - Large and bold */}
        <div 
          className="text-xl md:text-2xl lg:text-3xl font-extrabold leading-none whitespace-nowrap"
          style={{ 
            color: 'var(--primary)',
            fontFamily: 'var(--font-inter), Inter, sans-serif'
          }}
        >
          {value}
        </div>
      </div>
      
      {/* Label */}
      <h3 
        className="text-xs md:text-sm font-bold mb-1"
        style={{ 
          color: 'var(--foreground)',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif'
        }}
      >
        {label}
      </h3>
      
      {/* Description */}
      <p 
        className="text-xs leading-relaxed"
        style={{ 
          color: 'var(--on-background)',
          fontFamily: 'var(--font-manrope), Manrope, sans-serif'
        }}
      >
        {description}
      </p>
    </motion.div>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalRevenue: 'R$ 0',
    totalStores: '0',
    totalCustomers: '0'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/stats', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar estatísticas');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setStats({
            totalRevenue: result.data.totalRevenue || 'R$ 0',
            totalStores: result.data.totalStores || '0+',
            totalCustomers: result.data.totalCustomers || '0+'
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Manter valores padrão em caso de erro
        setStats({
          totalRevenue: 'R$ 0',
          totalStores: '0+',
          totalCustomers: '0+'
        });
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      icon: DollarSign,
      value: stats.totalRevenue,
      label: 'Faturado total',
      description: 'em vendas processadas',
      delay: 0.1
    },
    {
      icon: Store,
      value: stats.totalStores,
      label: 'Lojas criadas',
      description: 'negócios em operação',
      delay: 0.2
    },
    {
      icon: Users,
      value: stats.totalCustomers,
      label: 'Clientes atendidos',
      description: 'pessoas satisfeitas',
      delay: 0.3
    }
  ];

  return (
    <section 
      className="relative py-12 md:py-24 lg:py-32 overflow-hidden overflow-x-hidden"
      style={{ 
        backgroundColor: 'var(--background)',
        zIndex: 25
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--primary) 1px, transparent 1px),
              linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start w-full">
            {/* Left Side - Images Collage */}
            <motion.div
              className="relative w-full max-w-full overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4 w-full h-auto">
                {/* Top Left Image */}
                <motion.div
                  className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl bg-white w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src="/imgs_lp (1).png"
                      alt="Crescimento"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </motion.div>

                {/* Top Right Image */}
                <motion.div
                  className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl bg-white w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src="/imgs_lp (2).png"
                      alt="Lojas"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </motion.div>

                {/* Bottom Left Image */}
                <motion.div
                  className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl bg-white w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src="/imgs_lp (3).png"
                      alt="Clientes"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </motion.div>

                {/* Bottom Right - Floating Card */}
                <motion.div
                  className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl bg-white w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src="/imgs_lp (4).png"
                      alt="Vendas"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  {/* Overlay com informações de vendas */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-[var(--primary)]/95 to-transparent">
                    <div className="flex items-center justify-between mb-1.5 md:mb-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                      <div className="text-[10px] md:text-xs opacity-70 text-white">•••</div>
                    </div>
                    <p className="text-xs md:text-sm opacity-90 mb-0.5 md:mb-1 text-white">Total vendas</p>
                    <p className="text-lg md:text-2xl font-bold text-white">{stats.totalRevenue}</p>
                    <p className="text-[10px] md:text-xs opacity-70 mt-0.5 md:mt-1 text-white">Últimos 30 dias</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Statistics */}
            <motion.div
              className="flex flex-col space-y-4 md:space-y-5 mt-6 md:mt-0"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Title Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-2 md:space-y-3"
              >
                <h2 
                  className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight"
                  style={{ 
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  A plataforma que{' '}
                  <span style={{ color: 'var(--primary)' }}>transforma</span>{' '}
                  ideias em negócios
                </h2>
                <p 
                  className="text-xs md:text-base lg:text-lg leading-relaxed"
                  style={{ 
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    color: 'var(--on-background)'
                  }}
                >
                  Números reais de empreendedores que já estão vendendo online
                </p>
              </motion.div>

              {/* Divider Line */}
              <div 
                className="h-px w-full"
                style={{ 
                  backgroundColor: 'var(--on-background)',
                  opacity: 0.1
                }}
              />

              {/* Stats Grid - 3 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-4">
                {statsData.map((stat, index) => (
                  <StatCard
                    key={index}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                    description={stat.description}
                    delay={stat.delay}
                  />
                ))}
              </div>

              {/* Features Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-3 md:pt-2"
              >
                {/* Feature 1 */}
                <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-lg bg-[var(--background)] border border-[var(--on-background)]/10">
                  <div 
                    className="w-5 h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: '#FFFFFF'
                    }}
                  >
                    <Zap className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>
                      Setup rápido
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--on-background)' }}>
                      Loja pronta em minutos
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-lg bg-[var(--background)] border border-[var(--on-background)]/10">
                  <div 
                    className="w-5 h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: '#FFFFFF'
                    }}
                  >
                    <Shield className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>
                      Seguro e confiável
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--on-background)' }}>
                      Pagamentos protegidos
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-lg bg-[var(--background)] border border-[var(--on-background)]/10">
                  <div 
                    className="w-5 h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: '#FFFFFF'
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>
                      Sem mensalidade
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--on-background)' }}>
                      Pague apenas por venda
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Video Embed Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="pt-2"
              >
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-3 md:pt-2"
              >
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/seller/auth/register'}
                  className="w-full sm:w-auto text-sm md:text-base px-5 py-2.5"
                >
                  Começar agora
                  <ArrowRight size={16} />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

