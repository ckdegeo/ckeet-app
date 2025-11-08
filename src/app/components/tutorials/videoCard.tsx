'use client';

import { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import Image from 'next/image';

interface VideoCardProps {
  title: string;
  videoId: string;
  thumbnail?: string;
  className?: string;
}

export default function VideoCard({ title, videoId, thumbnail, className = '' }: VideoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getThumbnail = () => {
    if (thumbnail) return thumbnail;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fechar modal com tecla ESC e prevenir scroll do body
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div
        className={`
          relative group cursor-pointer
          bg-[var(--surface)] border border-[var(--on-background)]/10
          rounded-xl overflow-hidden
          transition-all hover:shadow-md hover:border-[var(--on-background)]/20
          ${className}
        `}
        onClick={openModal}
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-gray-100">
          <Image
            src={getThumbnail()}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay com botão de play */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={24} className="text-[var(--primary)] ml-1" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Título */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      {/* Modal do vídeo */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

          {/* Modal Content */}
          <div
            className="relative z-10 w-full max-w-4xl bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--on-background)]/10">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-[var(--on-background)]/10 transition-colors"
                aria-label="Fechar modal"
              >
                <X size={20} className="text-[var(--on-background)]" />
              </button>
            </div>

            {/* YouTube Player */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&vq=hd1080&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

