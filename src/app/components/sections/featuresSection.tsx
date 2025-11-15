'use client';

import { motion } from 'framer-motion';
import { UserPlus, Globe, Palette, CreditCard, CheckCircle2 } from 'lucide-react';
import Button from '@/app/components/buttons/button';

interface StepCardProps {
  step: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  delay?: number;
}

function StepCard({ step, icon: Icon, title, description, delay = 0 }: StepCardProps) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.6, -0.05, 0.01, 0.99] }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      {/* Card 3D Effect */}
      <div 
        className="relative bg-white rounded-2xl md:rounded-3xl p-6 sm:p-7 md:p-8 lg:p-10 shadow-2xl transition-all duration-500 border-2 border-white/20"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'perspective(1000px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Gradient Border Effect */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Step Number Badge */}
        <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 md:-top-6 md:-left-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl z-10 border-3 sm:border-4 border-white"
          style={{ backgroundColor: 'var(--primary)' }}>
          <span className="text-xl sm:text-2xl md:text-2xl font-bold text-white">{step}</span>
        </div>

        {/* Arrow Indicator - Outside content div for proper positioning */}
        {step < 4 && (
          <div className="absolute -right-3 sm:-right-4 md:-right-6 top-1/2 -translate-y-1/2 hidden lg:block z-20">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ color: '#FFFFFF' }}
            >
              <svg width="32" height="32" className="md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div 
            className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: '#FFFFFF',
              boxShadow: '0 15px 40px rgba(189, 37, 60, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <Icon size={28} className="sm:w-8 sm:h-8 md:w-9 md:h-9" />
          </div>

          {/* Title */}
          <h3 
            className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-3 md:mb-4"
            style={{ 
              color: 'var(--foreground)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            {title}
          </h3>

          {/* Description */}
          <p 
            className="text-sm sm:text-base md:text-lg leading-relaxed"
            style={{ color: 'var(--on-background)' }}
          >
            {description}
          </p>
        </div>

        {/* Glow Effect on Hover */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, var(--primary) 0%, transparent 70%)`,
            filter: 'blur(20px)'
          }}
        />
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: 'Criar conta',
      description: 'Cadastre-se gratuitamente em menos de 2 minutos. Sem necessidade de cartão de crédito ou compromissos.'
    },
    {
      step: 2,
      icon: Globe,
      title: 'Escolher domínio',
      description: 'Personalize o endereço da sua loja com um domínio único e profissional. Exemplo: sualoja.ckeet.store'
    },
    {
      step: 3,
      icon: Palette,
      title: 'Configurar visual',
      description: 'Customize cores, logo e layout da sua loja para refletir a identidade da sua marca em poucos cliques.'
    },
    {
      step: 4,
      icon: CreditCard,
      title: 'Conectar pagamento',
      description: 'Integre com Mercado Pago e comece a receber pagamentos via PIX e cartão de crédito instantaneamente.'
    }
  ];

  return (
    <section 
      className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden"
      style={{ 
        backgroundColor: 'var(--primary)',
        zIndex: 20
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
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <motion.div
            className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20 px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 md:mb-6 text-white"
              style={{ 
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              Comece a vender em 4 passos
            </h2>
            <p 
              className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
            >
              Simples, rápido e sem complicação. Sua loja virtual pronta em minutos
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative px-4 sm:px-0">
            {/* Connecting Line (Desktop only) */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 z-0"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)',
                transform: 'translateY(-50%)'
              }}
            />

            {steps.map((step, index) => (
              <StepCard
                key={index}
                step={step.step}
                icon={step.icon}
                title={step.title}
                description={step.description}
                delay={index * 0.15}
              />
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            className="flex justify-center mt-10 sm:mt-12 md:mt-16 lg:mt-20 px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              variant="primary"
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
            >
              <CheckCircle2 size={20} className="text-white" />
              <span className="text-white">
                Pronto! Agora é só começar a vender
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
