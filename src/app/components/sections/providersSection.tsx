'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, CreditCard, CheckCircle2 } from 'lucide-react';
import Button from '@/app/components/buttons/button';
import { useState, useEffect } from 'react';

const providers = [
  { name: 'Mercado Pago', image: '/mp.png', angle: 0 },
  { name: 'Asaas', image: '/asaas.png', angle: 72 },
  { name: 'PagBank', image: '/pagbank.png', angle: 144 },
  { name: 'Stripe', image: '/stripe.png', angle: 216 },
  { name: 'Efi', image: '/efi.png', angle: 288 }
];

export default function ProvidersSection() {
  const [radius, setRadius] = useState(160);

  useEffect(() => {
    const updateRadius = () => {
      setRadius(window.innerWidth >= 768 ? 160 : 120);
    };
    
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  return (
    <section 
      className="relative py-8 md:py-12 lg:py-16 overflow-hidden"
      style={{ 
        backgroundColor: 'var(--background)',
        zIndex: 15
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
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Circular Logo Display */}
            <motion.div
              className="relative flex items-center justify-center py-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full max-w-[500px] md:max-w-[600px] aspect-square mx-auto">
                {/* Orbital Lines - SVG com mais círculos */}
                <svg 
                  className="absolute inset-0 w-full h-full"
                  style={{ zIndex: 1, pointerEvents: 'none' }}
                  viewBox="0 0 500 500"
                >
                  {/* Círculo orbital 1 - interno */}
                  <circle
                    cx="250"
                    cy="250"
                    r={radius - 20}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    opacity="0.15"
                  />
                  {/* Círculo orbital 2 - principal */}
                  <circle
                    cx="250"
                    cy="250"
                    r={radius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    opacity="0.25"
                  />
                  {/* Círculo orbital 3 - externo */}
                  <circle
                    cx="250"
                    cy="250"
                    r={radius + 20}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    opacity="0.15"
                  />
                  {/* Círculo orbital 4 - mais externo */}
                  <circle
                    cx="250"
                    cy="250"
                    r={radius + 40}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    opacity="0.1"
                  />
                </svg>

                {/* Central Logo/Circle */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--primary)',
                    boxShadow: '0 10px 40px rgba(189, 37, 60, 0.3)',
                    zIndex: 10
                  }}
                  animate={{
                    boxShadow: [
                      '0 10px 40px rgba(189, 37, 60, 0.3)',
                      '0 15px 50px rgba(189, 37, 60, 0.4)',
                      '0 10px 40px rgba(189, 37, 60, 0.3)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                </motion.div>

                {/* Provider Logos */}
                {providers.map((provider, index) => {
                  const angleRad = (provider.angle * Math.PI) / 180;
                  // Calcular posições em porcentagem relativa ao tamanho do container (viewBox 500)
                  const radiusPercent = radius / 250; // 250 é metade de 500 (viewBox)
                  const x = 50 + (Math.cos(angleRad) * radiusPercent * 50); // 50% + offset
                  const y = 50 + (Math.sin(angleRad) * radiusPercent * 50);
                  
                  return (
                    <motion.div
                      key={provider.name}
                      className="absolute w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white shadow-xl flex items-center justify-center p-2 sm:p-2.5 md:p-3 border-2 border-gray-100 hover:border-[var(--primary)] transition-colors"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 200
                      }}
                      whileHover={{ 
                        scale: 1.15,
                        boxShadow: '0 15px 50px rgba(189, 37, 60, 0.25)',
                        zIndex: 15
                      }}
                    >
                      <Image
                        src={provider.image}
                        alt={provider.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              className="flex flex-col space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Title Section */}
              <div className="space-y-4 md:space-y-5">
                <h2 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight"
                  style={{ 
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  Escolha seu{' '}
                  <span style={{ color: 'var(--primary)' }}>provider</span>{' '}
                  de pagamento
                </h2>
                <p 
                  className="text-base md:text-lg leading-relaxed max-w-xl"
                  style={{ 
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    color: 'var(--on-background)'
                  }}
                >
                  Integre com os principais gateways do mercado. Escolha o melhor para seu negócio e comece a receber em minutos.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: '#FFFFFF'
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                      Múltiplas opções
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--on-background)' }}>
                      Mercado Pago, Asaas, PagBank, Stripe, Efi e mais.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: '#FFFFFF'
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                      Configuração simples
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--on-background)' }}>
                      Conecte em poucos cliques e receba pagamentos instantaneamente.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: '#FFFFFF'
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                      Flexibilidade total
                    </p>
                    <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--on-background)' }}>
                      Troque de provider quando quiser. Você tem o controle.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-6">
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/seller/auth/register'}
                  className="w-full sm:w-auto"
                >
                  Fazer integração e começar a vender
                  <ArrowRight size={18} />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

