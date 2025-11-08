'use client';

import { useState, useMemo, useEffect } from 'react';
import VideoCarousel from '@/app/components/tutorials/videoCarousel';
import Search from '@/app/components/inputs/search';
import TutorialsSkeleton from '@/app/components/tutorials/tutorialsSkeleton';

interface Video {
  id: string;
  title: string;
  videoId: string;
  thumbnail?: string;
  order?: number;
}

interface TutorialSection {
  id: string;
  title: string;
  order?: number;
  videos: Video[];
}

export default function TutorialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tutorialSections, setTutorialSections] = useState<TutorialSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar tutoriais do banco de dados
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tutorials/sections');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar tutoriais');
        }

        const data = await response.json();
        
        // Interface para dados da API
        interface ApiSection {
          id: string;
          title: string;
          order?: number;
          videos: Array<{
            id: string;
            title: string;
            videoId: string;
            order?: number;
          }>;
        }
        
        // Mapear dados do banco para o formato esperado
        const sections: TutorialSection[] = (data.sections as ApiSection[]).map((section) => ({
          id: section.id,
          title: section.title,
          order: section.order || 0, // Ordem vertical (entre seções)
          videos: section.videos.map((video) => ({
            id: video.id,
            title: video.title,
            videoId: video.videoId,
            order: video.order || 0, // Ordem horizontal (dentro da seção)
          })),
        }));

        // Ordenar seções por order (ordem vertical)
        const sortedSections = sections.sort((a, b) => {
          const aOrder = a.order ?? 0;
          const bOrder = b.order ?? 0;
          return aOrder - bOrder;
        });

        // Ordenar vídeos dentro de cada seção por order (ordem horizontal)
        const sectionsWithSortedVideos = sortedSections.map((section) => ({
          ...section,
          videos: [...section.videos].sort((a, b) => {
            const aOrder = a.order ?? 0;
            const bOrder = b.order ?? 0;
            return aOrder - bOrder;
          }),
        }));

        setTutorialSections(sectionsWithSortedVideos);
      } catch (err) {
        console.error('Erro ao buscar tutoriais:', err);
        setError('Erro ao carregar tutoriais');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  // Filtrar seções e vídeos baseado no termo de busca
  const filteredSections = useMemo(() => {
    // Ordenar seções por order (ordem vertical)
    const sortedSections = [...tutorialSections].sort((a, b) => {
      const aOrder = a.order ?? 0;
      const bOrder = b.order ?? 0;
      return aOrder - bOrder;
    });

    // Ordenar vídeos dentro de cada seção por order (ordem horizontal)
    const sectionsWithSortedVideos = sortedSections.map((section) => ({
      ...section,
      videos: [...section.videos].sort((a, b) => {
        const aOrder = a.order ?? 0;
        const bOrder = b.order ?? 0;
        return aOrder - bOrder;
      }),
    }));

    if (!searchTerm.trim()) {
      return sectionsWithSortedVideos;
    }

    const term = searchTerm.toLowerCase().trim();

    return sectionsWithSortedVideos
      .map((section) => {
        // Filtrar vídeos que correspondem ao termo de busca
        const filteredVideos = section.videos.filter((video) =>
          video.title.toLowerCase().includes(term)
        );

        // Incluir seção se tiver vídeos correspondentes ou se o título da seção corresponder
        if (filteredVideos.length > 0 || section.title.toLowerCase().includes(term)) {
          return {
            ...section,
            videos: filteredVideos.length > 0 ? filteredVideos : section.videos,
          };
        }

        return null;
      })
      .filter((section): section is TutorialSection => section !== null);
  }, [searchTerm, tutorialSections]);

  // Mostrar loading
  if (isLoading) {
    return <TutorialsSkeleton />;
  }

  // Mostrar erro
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[var(--on-background)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-full"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Tutoriais
        </h1>

        {/* Busca */}
        <div className="w-full sm:max-w-md">
          <Search
            placeholder="Pesquisar tutoriais... (ex: keyauth, mercado pago, loja)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Seções de tutoriais */}
      {filteredSections.length > 0 ? (
        <div className="space-y-12">
          {filteredSections.map((section, index) => (
            <div key={section.id}>
              {/* Divider antes de cada seção (exceto a primeira) */}
              {index > 0 && (
                <div className="mb-6 -mt-12 border-t border-[var(--on-background)]/10"></div>
              )}
              
              <div className="space-y-4">
                {/* Título da seção */}
                <h2 className="text-xl font-semibold text-[var(--foreground)]">
                  {section.title}
                </h2>

                {/* Carrossel de vídeos */}
                <VideoCarousel videos={section.videos} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--on-background)]/5 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--on-background)]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            {searchTerm.trim() ? 'Nenhum tutorial encontrado' : 'Nenhum tutorial disponível'}
          </h3>
          <p className="text-[var(--on-background)] mb-6">
            {searchTerm.trim() 
              ? `Não encontramos tutoriais para "${searchTerm}". Tente buscar com outros termos.`
              : 'Ainda não há tutoriais disponíveis. Em breve teremos conteúdo para você!'}
          </p>
        </div>
      )}
    </div>
  );
}
