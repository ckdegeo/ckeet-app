'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, ChevronLeft as MoveLeft, ChevronRight as MoveRight } from 'lucide-react';
import VideoCard from './videoCard';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';

interface Video {
  id: string;
  title: string;
  videoId: string;
  thumbnail?: string;
  order?: number;
}

interface VideoCarouselProps {
  videos: Video[];
  className?: string;
  sectionId?: string;
  onEditVideo?: (videoId: string, sectionId: string) => void;
  onDeleteVideo?: (videoId: string, sectionId: string) => void;
  onMoveVideoLeft?: (videoId: string, sectionId: string) => void;
  onMoveVideoRight?: (videoId: string, sectionId: string) => void;
  showActions?: boolean;
}

export default function VideoCarousel({ 
  videos, 
  className = '',
  sectionId = '',
  onEditVideo,
  onDeleteVideo,
  onMoveVideoLeft,
  onMoveVideoRight,
  showActions = false
}: VideoCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Verificar scrollabilidade inicial e ao redimensionar
  useEffect(() => {
    // Aguardar renderização completa
    const timer = setTimeout(() => {
      checkScrollability();
    }, 100);
    
    const handleResize = () => {
      setTimeout(checkScrollability, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [videos]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    const newScrollLeft =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Container com scroll horizontal */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {videos.map((video, index) => (
          <div key={video.id} className="flex-shrink-0 w-[320px] relative group">
            {showActions && sectionId && (
              <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Botões de reordenar (horizontal) */}
                <IconOnlyButton
                  icon={MoveLeft}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveVideoLeft?.(video.id, sectionId);
                  }}
                  variant="surface"
                  className="w-8 h-8 bg-white/90 hover:bg-white"
                  aria-label="Mover vídeo para esquerda"
                  disabled={index === 0}
                />
                <IconOnlyButton
                  icon={MoveRight}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveVideoRight?.(video.id, sectionId);
                  }}
                  variant="surface"
                  className="w-8 h-8 bg-white/90 hover:bg-white"
                  aria-label="Mover vídeo para direita"
                  disabled={index === videos.length - 1}
                />
                {/* Botões de editar/excluir */}
                <IconOnlyButton
                  icon={Edit}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditVideo?.(video.id, sectionId);
                  }}
                  variant="surface"
                  className="w-8 h-8 bg-white/90 hover:bg-white"
                  aria-label="Editar vídeo"
                />
                <IconOnlyButton
                  icon={Trash2}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVideo?.(video.id, sectionId);
                  }}
                  variant="surface"
                  className="w-8 h-8 bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                  aria-label="Excluir vídeo"
                />
              </div>
            )}
            <VideoCard
              title={video.title}
              videoId={video.videoId}
              thumbnail={video.thumbnail}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Botões de navegação */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-[var(--surface)] border border-[var(--on-background)]/20 rounded-full flex items-center justify-center hover:bg-[var(--on-background)]/5 transition-colors shadow-lg z-10"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft size={20} className="text-[var(--on-background)]" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-[var(--surface)] border border-[var(--on-background)]/20 rounded-full flex items-center justify-center hover:bg-[var(--on-background)]/5 transition-colors shadow-lg z-10"
          aria-label="Rolar para direita"
        >
          <ChevronRight size={20} className="text-[var(--on-background)]" />
        </button>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

