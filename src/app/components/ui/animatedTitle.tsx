'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTitleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  variant?: 'fade' | 'slide' | 'scale' | 'reveal';
  highlight?: {
    text: string;
    color?: string;
  };
}

export default function AnimatedTitle({
  children,
  className = '',
  style,
  delay = 0,
  variant = 'fade',
  highlight
}: AnimatedTitleProps) {
  const variants = {
    fade: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] as const, delay }
    },
    slide: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] as const, delay }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] as const, delay }
    },
    reveal: {
      initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
      transition: { duration: 1, ease: [0.6, -0.05, 0.01, 0.99] as const, delay }
    }
  };

  const selectedVariant = variants[variant];

  // Se houver highlight, processar o texto
  if (highlight && typeof children === 'string') {
    const text = children as string;
    const parts = text.split(highlight.text);
    
    return (
      <motion.h1
        className={className}
        style={style}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        transition={selectedVariant.transition}
      >
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <motion.span
                className="relative inline-block px-2 py-1"
                style={{ 
                  backgroundColor: highlight.color || 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 'inherit'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: delay + 0.3 + (index * 0.1),
                  ease: [0.6, -0.05, 0.01, 0.99] as const
                }}
              >
                {highlight.text}
              </motion.span>
            )}
          </span>
        ))}
      </motion.h1>
    );
  }

  return (
    <motion.h1
      className={className}
      style={style}
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      transition={selectedVariant.transition}
    >
      {children}
    </motion.h1>
  );
}

