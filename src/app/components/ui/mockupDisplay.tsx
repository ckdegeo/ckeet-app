'use client';

import Image from 'next/image';

interface MockupDisplayProps {
  src: string;
  alt: string;
  rotation?: number;
  position?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function MockupDisplay({
  src,
  alt,
  rotation = 0,
  position = 'center',
  size = 'medium',
  className = ''
}: MockupDisplayProps) {
  const sizeClasses = {
    small: 'w-64 md:w-80',
    medium: 'w-80 md:w-96 lg:w-[500px]',
    large: 'w-96 md:w-[600px] lg:w-[700px]'
  };

  const positionClasses = {
    left: 'left-0 md:left-10',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-0 md:right-10'
  };

  return (
    <div
      className={`
        absolute ${positionClasses[position]}
        ${sizeClasses[size]}
        transform transition-all duration-500 hover:scale-105
        ${className}
      `}
      style={{
        transform: `rotate(${rotation}deg) ${position === 'center' ? 'translateX(-50%)' : ''}`,
        filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))'
      }}
    >
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white border-4 border-gray-200 shadow-2xl">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority={size === 'large'}
        />
        {/* Glow effect */}
        <div 
          className="absolute -inset-1 rounded-2xl blur-xl opacity-30"
          style={{
            background: `linear-gradient(135deg, var(--primary), var(--secondary))`
          }}
        />
      </div>
    </div>
  );
}

