'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import Button from '@/app/components/buttons/button';

export default function PricingSection() {
  return (
    <section 
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden"
      style={{ 
        backgroundColor: 'var(--primary)',
        zIndex: 15
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Card Branco - Ocupa 100% da grid (2 colunas) */}
          <motion.div
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8 lg:p-10 lg:col-span-2"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Flex Container - Header à esquerda, Conteúdo à direita */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* Header - Esquerda */}
              <div className="flex-1 w-full lg:w-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full mb-4"
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: '#FFFFFF'
                  }}
                >
                  <DollarSign size={28} className="md:w-8 md:h-8" />
                </motion.div>

                <h2 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3 md:mb-4"
                  style={{ 
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    color: 'var(--foreground)'
                  }}
                >
                  Taxas{' '}
                  <span 
                    className="px-2 py-1"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      color: '#FFFFFF'
                    }}
                  >
                    transparentes
                  </span>
                </h2>
                <p 
                  className="text-sm md:text-base lg:text-lg leading-relaxed mb-6 md:mb-8"
                  style={{ 
                    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                    color: 'var(--on-background)'
                  }}
                >
                  Sem mensalidade, sem taxas escondidas. Você paga apenas quando vende.
                </p>

                {/* Pricing Highlight - Abaixo do header */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-baseline gap-2">
                      <span 
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold"
                        style={{ 
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          color: 'var(--foreground)'
                        }}
                      >
                        <span 
                          className="px-2.5 py-1"
                          style={{ 
                            backgroundColor: '#000000', 
                            color: '#FFFFFF'
                          }}
                        >
                          3.49%
                        </span>
                      </span>
                      <span 
                        className="text-xl md:text-2xl font-bold"
                        style={{ 
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          color: 'var(--on-background)'
                        }}
                      >
                        +
                      </span>
                      <span 
                        className="text-3xl md:text-4xl lg:text-5xl font-extrabold"
                        style={{ 
                          fontFamily: 'var(--font-inter), Inter, sans-serif',
                          color: 'var(--foreground)'
                        }}
                      >
                        <span 
                          className="px-2.5 py-1"
                          style={{ 
                            backgroundColor: '#000000', 
                            color: '#FFFFFF'
                          }}
                        >
                          R$ 0,50
                        </span>
                        <p 
                      className="text-sm md:text-base lg:text-lg mt-1.5 font-bold"
                      style={{ 
                        fontFamily: 'var(--font-manrope), Manrope, sans-serif',
                        color: 'var(--on-background)'
                      }}
                    >
                      por venda
                    </p>
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Conteúdo - Direita */}
              <div className="flex-1 w-full lg:w-auto">

                {/* Features List */}
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              <motion.div
                className="flex items-start gap-3 p-3 md:p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div 
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: '#FFFFFF'
                  }}
                >
                  <CheckCircle2 size={16} className="md:w-4 md:h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                    <span 
                      className="px-2 py-0.5"
                      style={{ 
                        backgroundColor: '#000000', 
                        color: '#FFFFFF'
                      }}
                    >
                      Sem mensalidade
                    </span>
                  </p>
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--on-background)' }}>
                    Não cobramos taxas fixas. Você só paga quando faz uma venda.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 p-3 md:p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div 
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: '#FFFFFF'
                  }}
                >
                  <CheckCircle2 size={16} className="md:w-4 md:h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                    <span 
                      className="px-2 py-0.5"
                      style={{ 
                        backgroundColor: 'var(--primary)', 
                        color: '#FFFFFF'
                      }}
                    >
                      Taxa única
                    </span>
                  </p>
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--on-background)' }}>
                    Apenas 3.49% + R$ 0,50 por venda. Sem surpresas, sem letras miúdas.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 p-3 md:p-4 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div 
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: '#FFFFFF'
                  }}
                >
                  <CheckCircle2 size={16} className="md:w-4 md:h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                    <span 
                      className="px-2 py-0.5"
                      style={{ 
                        backgroundColor: '#000000', 
                        color: '#FFFFFF'
                      }}
                    >
                      Sem custos ocultos
                    </span>
                  </p>
                  <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--on-background)' }}>
                    Tudo que você precisa saber está aqui. Transparência total.
                  </p>
                </div>
              </motion.div>
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Button
                    variant="primary"
                    onClick={() => window.location.href = '/seller/auth/register'}
                    className="w-full sm:w-auto"
                  >
                    Aproveitar promocão de taxa
                    <ArrowRight size={18} />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
