'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedSubtitleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  variant?: 'fade' | 'slide' | 'word' | 'char';
}

export default function AnimatedSubtitle({
  children,
  className = '',
  style,
  delay = 0.2,
  variant = 'fade'
}: AnimatedSubtitleProps) {
  // Animações por palavra
  if (variant === 'word' && typeof children === 'string') {
    const words = (children as string).split(' ');
    
    return (
      <motion.h2
        className={className}
        style={style}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05,
              delayChildren: delay
            }
          }
        }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-2"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.5,
                  ease: [0.6, -0.05, 0.01, 0.99]
                }
              }
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h2>
    );
  }

  // Animações por caractere
  if (variant === 'char' && typeof children === 'string') {
    const chars = (children as string).split('');
    
    return (
      <motion.h2
        className={className}
        style={style}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.02,
              delayChildren: delay
            }
          }
        }}
      >
        {chars.map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 20, rotateX: -90 },
              visible: { 
                opacity: 1, 
                y: 0,
                rotateX: 0,
                transition: {
                  duration: 0.3,
                  ease: [0.6, -0.05, 0.01, 0.99]
                }
              }
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h2>
    );
  }

  // Animações simples (fade/slide)
  const fadeVariant = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] as const, delay }
  };

  const slideVariant = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] as const, delay }
  };

  // Neste ponto, variant só pode ser 'fade' ou 'slide' pois 'word' e 'char' já foram tratados acima
  const selectedVariant = variant === 'fade' ? fadeVariant : variant === 'slide' ? slideVariant : fadeVariant;

  return (
    <motion.h2
      className={className}
      style={style}
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      transition={selectedVariant.transition}
    >
      {children}
    </motion.h2>
  );
}

