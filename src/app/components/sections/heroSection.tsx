'use client';

import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/app/components/buttons/button';
import AnimatedTitle from '@/app/components/ui/animatedTitle';
import AnimatedText from '@/app/components/ui/animatedText';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

export default function HeroSection({
  onGetStarted,
  onWatchDemo
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[50vh] md:min-h-[50vh] flex items-center justify-center overflow-visible pt-8 pb-8 md:pt-4 md:pb-4" style={{ zIndex: 10 }}>
      {/* Grid Background - Professional 3D Perspective */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main Grid Layer - More Visible */}
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(189, 37, 60, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(189, 37, 60, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 0 0',
            transform: 'perspective(1200px) rotateX(65deg) scale(1.1)',
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            maskImage: 'radial-gradient(ellipse 120% 100% at 50% 50%, black 40%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 120% 100% at 50% 50%, black 40%, transparent 90%)'
          }}
          animate={{
            backgroundPosition: ['0 0, 0 0', '60px 60px, 60px 60px']
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Secondary Grid Layer - Subtle Depth */}
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(189, 37, 60, 0.08) 0.5px, transparent 0.5px),
              linear-gradient(to bottom, rgba(189, 37, 60, 0.08) 0.5px, transparent 0.5px)
            `,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 0 0',
            transform: 'perspective(1400px) rotateX(70deg) scale(1.2)',
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            maskImage: 'radial-gradient(ellipse 110% 90% at 50% 50%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 110% 90% at 50% 50%, black 30%, transparent 85%)'
          }}
          animate={{
            backgroundPosition: ['0 0, 0 0', '-30px -30px, -30px -30px']
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Gradient Overlay - Reduced opacity to show grid better */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/30 to-[var(--background)]/80" />

      {/* Glow Effects - Very Subtle Background Only */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(189, 37, 60, 0.04) 0%, transparent 70%)`,
          filter: 'blur(100px)',
          zIndex: 0
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <AnimatedTitle
            variant="reveal"
            delay={0.2}
            highlight={{
              text: 'loja virtual',
              color: 'var(--primary)'
            }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-4 leading-[1.1] tracking-tight px-2"
            style={{ 
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              color: 'var(--foreground)'
            }}
          >
            Crie sua loja virtual em minutos
          </AnimatedTitle>

          {/* Sub-headline - Badges */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.span
              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold border"
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--primary)',
                borderColor: 'var(--primary-variant)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              Sem código
            </motion.span>
            <motion.span
              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs sm:text-sm md:text-base font-semibold border"
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--primary)',
                borderColor: 'var(--primary-variant)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              Sem complicação
            </motion.span>
          </motion.div>

          {/* Description */}
          <AnimatedText
            variant="fade"
            delay={0.8}
            className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4"
            style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
          >
            Venda produtos digitais sem mensalidade, apenas <span className="font-bold bg-black text-white px-2 py-1">3.49% + R$ 0,50</span> por venda.
          </AnimatedText>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="primary"
                onClick={onGetStarted}
              >
                Começar agora
                <ArrowRight size={20} />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={onWatchDemo}
              >
                <Play size={20} />
                Ver demonstração
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

