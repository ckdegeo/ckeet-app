'use client';

import Image from 'next/image';

interface LoadingSpinnerProps {
  /** Tamanho do spinner (small, medium, large) */
  size?: 'small' | 'medium' | 'large';
  /** Se deve ocupar a tela inteira (fullscreen) */
  fullscreen?: boolean;
  /** Se deve mostrar overlay escuro */
  overlay?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  fullscreen = false,
  overlay = false 
}: LoadingSpinnerProps) {
  // Logo é retangular (horizontal maior que vertical)
  // Proporção aproximada: 2.5:1 (width:height)
  const sizeConfig = {
    small: { width: 60, height: 24, class: 'w-[60px] h-6' },
    medium: { width: 100, height: 40, class: 'w-[100px] h-10' },
    large: { width: 160, height: 64, class: 'w-[160px] h-16' }
  };

  const config = sizeConfig[size];

  const containerClasses = fullscreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm'
    : 'flex items-center justify-center';

  const overlayClasses = overlay 
    ? 'bg-black bg-opacity-20' 
    : '';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ckeetPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.75;
            transform: scale(0.95);
          }
        }
        .ckeet-loading {
          animation: ckeetPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
      <div className={`${containerClasses} ${overlayClasses}`}>
        <div className="relative">
          <Image
            src="/logo.png"
            alt="Ckeet"
            width={config.width}
            height={config.height}
            className={`${config.class} ckeet-loading object-contain`}
            priority
          />
        </div>
      </div>
    </>
  );
}

