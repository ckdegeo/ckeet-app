'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  variant?: 'fade' | 'slide' | 'word';
  as?: 'p' | 'span' | 'div';
}

export default function AnimatedText({
  children,
  className = '',
  style,
  delay = 0.4,
  variant = 'fade',
  as: Component = 'p'
}: AnimatedTextProps) {
  // Animações por palavra
  if (variant === 'word' && typeof children === 'string') {
    const words = (children as string).split(' ');
    
    const MotionComponent = motion[Component] as typeof motion.p;
    
    return (
      <MotionComponent
        className={className}
        style={style}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.03,
              delayChildren: delay
            }
          }
        }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-1"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: [0.6, -0.05, 0.01, 0.99]
                }
              }
            }}
          >
            {word}
          </motion.span>
        ))}
      </MotionComponent>
    );
  }

  // Animações simples
  const variants = {
    fade: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] as const, delay }
    },
    slide: {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] as const, delay }
    }
  };

  const selectedVariant = variants[variant as 'fade' | 'slide'];
  const MotionComponent = motion[Component] as typeof motion.p;

  return (
    <MotionComponent
      className={className}
      style={style}
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      transition={selectedVariant.transition}
    >
      {children}
    </MotionComponent>
  );
}

