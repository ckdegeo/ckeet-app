'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import VideoCarousel from '@/app/components/tutorials/videoCarousel';
import Search from '@/app/components/inputs/search';
import Button from '@/app/components/buttons/button';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import SectionModal from '@/app/components/modals/sectionModal';
import VideoModal from '@/app/components/modals/videoModal';
import DeleteSectionModal from '@/app/components/modals/deleteSectionModal';
import DeleteVideoModal from '@/app/components/modals/deleteVideoModal';
import TutorialsSkeleton from '@/app/components/tutorials/tutorialsSkeleton';
import { getAccessToken } from '@/lib/utils/authUtils';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';


interface TutorialSection {
  id: string;
  title: string;
  order?: number; // Ordem vertical (entre seções)
  videos: Video[];
}

interface Video {
  id: string;
  title: string;
  videoId: string;
  thumbnail?: string;
  order?: number; // Ordem horizontal (dentro da seção)
}

export default function TutorialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tutorialSections, setTutorialSections] = useState<TutorialSection[]>([]);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDeleteSectionModalOpen, setIsDeleteSectionModalOpen] = useState(false);
  const [isDeleteVideoModalOpen, setIsDeleteVideoModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState<string>('');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingVideoTitle, setEditingVideoTitle] = useState<string>('');
  const [editingVideoVideoId, setEditingVideoVideoId] = useState<string>('');
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [deletingSectionName, setDeletingSectionName] = useState<string>('');
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [deletingVideoName, setDeletingVideoName] = useState<string>('');
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
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

        setTutorialSections(sections);
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

  // Criar nova sessão
  const handleCreateSection = async (sectionName: string) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        showErrorToast('Token de acesso não encontrado');
        return;
      }

      const response = await fetch('/api/tutorials/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: sectionName,
          order: tutorialSections.length,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão');
      }

      const data = await response.json();
      
      // Verificar estrutura da resposta
      const section = data.section || data.data?.section;
      
      if (!section || !section.id) {
        console.error('Resposta da API:', data);
        throw new Error('Resposta inválida da API: seção não encontrada');
      }
      
      // Adicionar nova sessão ao estado (ordenada por order)
      const newSection: TutorialSection = {
        id: section.id,
        title: section.title,
        order: section.order || tutorialSections.length, // Ordem vertical
        videos: [],
      };
      
      // Ordenar seções por order (ordem vertical)
      const updatedSections = [...tutorialSections, newSection].sort((a, b) => {
        const aOrder = a.order ?? 0;
        const bOrder = b.order ?? 0;
        return aOrder - bOrder;
      });
      
      setTutorialSections(updatedSections);
      showSuccessToast('Sessão criada com sucesso');
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
      showErrorToast(err instanceof Error ? err.message : 'Erro ao criar sessão');
    }
  };

  // Adicionar vídeo a uma sessão
  const handleAddVideo = async (videoData: { title: string; videoId: string }) => {
    if (!selectedSectionId) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        showErrorToast('Token de acesso não encontrado');
        return;
      }

      const response = await fetch('/api/tutorials/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sectionId: selectedSectionId,
          title: videoData.title,
          videoId: videoData.videoId,
          order: tutorialSections.find(s => s.id === selectedSectionId)?.videos.length || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar vídeo');
      }

      const data = await response.json();
      
      // Verificar estrutura da resposta
      const video = data.video || data.data?.video;
      
      if (!video || !video.id) {
        console.error('Resposta da API:', data);
        throw new Error('Resposta inválida da API: vídeo não encontrado');
      }
      
      // Adicionar novo vídeo ao estado
      const selectedSection = tutorialSections.find(s => s.id === selectedSectionId);
      const newVideo: Video = {
        id: video.id,
        title: video.title,
        videoId: video.videoId,
        order: video.order || (selectedSection?.videos.length || 0), // Ordem horizontal
      };

      // Adicionar vídeo e ordenar por order (ordem horizontal dentro da seção)
      setTutorialSections(
        tutorialSections.map((section) => {
          if (section.id === selectedSectionId) {
            const updatedVideos = [...section.videos, newVideo];
            // Ordenar vídeos por order (ordem horizontal)
            updatedVideos.sort((a, b) => {
              const aOrder = a.order ?? 0;
              const bOrder = b.order ?? 0;
              return aOrder - bOrder;
            });
            return { ...section, videos: updatedVideos };
          }
          return section;
        })
      );
      
      showSuccessToast('Vídeo adicionado com sucesso');
    } catch (err) {
      console.error('Erro ao adicionar vídeo:', err);
      showErrorToast(err instanceof Error ? err.message : 'Erro ao adicionar vídeo');
    }
  };

  // Abrir modal de adicionar vídeo para uma sessão específica
  const handleOpenVideoModal = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setEditingVideoId(null);
    setEditingVideoTitle('');
    setEditingVideoVideoId('');
    setIsVideoModalOpen(true);
  };

  // Editar sessão
  const handleEditSection = (sectionId: string) => {
    const section = tutorialSections.find(s => s.id === sectionId);
    if (section) {
      setEditingSectionId(sectionId);
      setEditingSectionName(section.title);
      setIsSectionModalOpen(true);
    }
  };

  // Salvar edição de sessão
  const handleSaveSection = async (sectionName: string) => {
    if (editingSectionId) {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          showErrorToast('Token de acesso não encontrado');
          return;
        }

        const response = await fetch(`/api/tutorials/sections/${editingSectionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: sectionName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao editar sessão');
        }

        const data = await response.json();
        const section = data.section || data.data?.section;

        if (!section || !section.id) {
          throw new Error('Resposta inválida da API');
        }

        setTutorialSections(
          tutorialSections.map(s =>
            s.id === editingSectionId
              ? { ...s, title: section.title }
              : s
          )
        );

        setEditingSectionId(null);
        setEditingSectionName('');
        showSuccessToast('Sessão editada com sucesso');
      } catch (err) {
        console.error('Erro ao editar sessão:', err);
        showErrorToast(err instanceof Error ? err.message : 'Erro ao editar sessão');
      }
    } else {
      // Criar nova sessão
      await handleCreateSection(sectionName);
    }
  };

  // Excluir sessão
  const handleDeleteSection = (sectionId: string) => {
    const section = tutorialSections.find(s => s.id === sectionId);
    if (section) {
      setDeletingSectionId(sectionId);
      setDeletingSectionName(section.title);
      setIsDeleteSectionModalOpen(true);
    }
  };

  // Confirmar exclusão de sessão
  const handleConfirmDeleteSection = async () => {
    if (!deletingSectionId) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        showErrorToast('Token de acesso não encontrado');
        return;
      }

      const response = await fetch(`/api/tutorials/sections/${deletingSectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir sessão');
      }

      setTutorialSections(tutorialSections.filter(s => s.id !== deletingSectionId));
      setDeletingSectionId(null);
      setDeletingSectionName('');
      showSuccessToast('Sessão excluída com sucesso');
    } catch (err) {
      console.error('Erro ao excluir sessão:', err);
      showErrorToast(err instanceof Error ? err.message : 'Erro ao excluir sessão');
    }
  };

  // Editar vídeo
  const handleEditVideo = (videoId: string, sectionId: string) => {
    const section = tutorialSections.find(s => s.id === sectionId);
    const video = section?.videos.find(v => v.id === videoId);
    if (video) {
      setEditingVideoId(videoId);
      setEditingVideoTitle(video.title);
      setEditingVideoVideoId(video.videoId);
      setSelectedSectionId(sectionId);
      setIsVideoModalOpen(true);
    }
  };

  // Salvar edição de vídeo
  const handleSaveVideo = async (videoData: { title: string; videoId: string }) => {
    if (editingVideoId) {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          showErrorToast('Token de acesso não encontrado');
          return;
        }

        const response = await fetch(`/api/tutorials/videos/${editingVideoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: videoData.title,
            videoId: videoData.videoId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao editar vídeo');
        }

        const data = await response.json();
        const video = data.video || data.data?.video;

        if (!video || !video.id) {
          throw new Error('Resposta inválida da API');
        }

        setTutorialSections(
          tutorialSections.map(section =>
            section.id === selectedSectionId
              ? {
                  ...section,
                  videos: section.videos.map(v =>
                    v.id === editingVideoId
                      ? { ...v, title: video.title, videoId: video.videoId }
                      : v
                  ),
                }
              : section
          )
        );

        setEditingVideoId(null);
        setEditingVideoTitle('');
        setEditingVideoVideoId('');
        showSuccessToast('Vídeo editado com sucesso');
      } catch (err) {
        console.error('Erro ao editar vídeo:', err);
        showErrorToast(err instanceof Error ? err.message : 'Erro ao editar vídeo');
      }
    } else {
      // Adicionar novo vídeo
      await handleAddVideo(videoData);
    }
  };

  // Excluir vídeo
  const handleDeleteVideo = (videoId: string, sectionId: string) => {
    const section = tutorialSections.find(s => s.id === sectionId);
    const video = section?.videos.find(v => v.id === videoId);
    if (video) {
      setDeletingVideoId(videoId);
      setDeletingVideoName(video.title);
      setSelectedSectionId(sectionId);
      setIsDeleteVideoModalOpen(true);
    }
  };

  // Confirmar exclusão de vídeo
  const handleConfirmDeleteVideo = async () => {
    if (!deletingVideoId || !selectedSectionId) return;

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        showErrorToast('Token de acesso não encontrado');
        return;
      }

      const response = await fetch(`/api/tutorials/videos/${deletingVideoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir vídeo');
      }

      setTutorialSections(
        tutorialSections.map(section =>
          section.id === selectedSectionId
            ? {
                ...section,
                videos: section.videos.filter(v => v.id !== deletingVideoId),
              }
            : section
        )
      );

      setDeletingVideoId(null);
      setDeletingVideoName('');
      showSuccessToast('Vídeo excluído com sucesso');
    } catch (err) {
      console.error('Erro ao excluir vídeo:', err);
      showErrorToast(err instanceof Error ? err.message : 'Erro ao excluir vídeo');
    }
  };

  // Mover sessão para cima (ordem vertical)
  const handleMoveSectionUp = (sectionId: string) => {
    const sortedSections = [...tutorialSections].sort((a, b) => {
      const aOrder = a.order ?? 0;
      const bOrder = b.order ?? 0;
      return aOrder - bOrder;
    });

    const currentIndex = sortedSections.findIndex(s => s.id === sectionId);
    if (currentIndex <= 0) return;

    const newSections = [...sortedSections];
    const temp = newSections[currentIndex].order ?? 0;
    newSections[currentIndex].order = newSections[currentIndex - 1].order ?? 0;
    newSections[currentIndex - 1].order = temp;

    setTutorialSections(newSections);
    setHasOrderChanges(true);
  };

  // Mover sessão para baixo (ordem vertical)
  const handleMoveSectionDown = (sectionId: string) => {
    const sortedSections = [...tutorialSections].sort((a, b) => {
      const aOrder = a.order ?? 0;
      const bOrder = b.order ?? 0;
      return aOrder - bOrder;
    });

    const currentIndex = sortedSections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1 || currentIndex >= sortedSections.length - 1) return;

    const newSections = [...sortedSections];
    const temp = newSections[currentIndex].order ?? 0;
    newSections[currentIndex].order = newSections[currentIndex + 1].order ?? 0;
    newSections[currentIndex + 1].order = temp;

    setTutorialSections(newSections);
    setHasOrderChanges(true);
  };

  // Mover vídeo para esquerda (ordem horizontal)
  const handleMoveVideoLeft = (videoId: string, sectionId: string) => {
    setTutorialSections(
      tutorialSections.map(section => {
        if (section.id === sectionId) {
          const sortedVideos = [...section.videos].sort((a, b) => {
            const aOrder = a.order ?? 0;
            const bOrder = b.order ?? 0;
            return aOrder - bOrder;
          });

          const currentIndex = sortedVideos.findIndex(v => v.id === videoId);
          if (currentIndex <= 0) return section;

          const newVideos = [...sortedVideos];
          const temp = newVideos[currentIndex].order ?? 0;
          newVideos[currentIndex].order = newVideos[currentIndex - 1].order ?? 0;
          newVideos[currentIndex - 1].order = temp;

          return { ...section, videos: newVideos };
        }
        return section;
      })
    );
    setHasOrderChanges(true);
  };

  // Mover vídeo para direita (ordem horizontal)
  const handleMoveVideoRight = (videoId: string, sectionId: string) => {
    setTutorialSections(
      tutorialSections.map(section => {
        if (section.id === sectionId) {
          const sortedVideos = [...section.videos].sort((a, b) => {
            const aOrder = a.order ?? 0;
            const bOrder = b.order ?? 0;
            return aOrder - bOrder;
          });

          const currentIndex = sortedVideos.findIndex(v => v.id === videoId);
          if (currentIndex === -1 || currentIndex >= sortedVideos.length - 1) return section;

          const newVideos = [...sortedVideos];
          const temp = newVideos[currentIndex].order ?? 0;
          newVideos[currentIndex].order = newVideos[currentIndex + 1].order ?? 0;
          newVideos[currentIndex + 1].order = temp;

          return { ...section, videos: newVideos };
        }
        return section;
      })
    );
    setHasOrderChanges(true);
  };

  // Salvar ordem
  const handleSaveOrder = async () => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        showErrorToast('Token de acesso não encontrado');
        return;
      }

      const sections = tutorialSections.map(s => ({
        id: s.id,
        order: s.order ?? 0,
      }));

      const videos = tutorialSections.flatMap(section =>
        section.videos.map(v => ({
          id: v.id,
          order: v.order ?? 0,
        }))
      );

      const response = await fetch('/api/tutorials/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ sections, videos }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar ordem');
      }

      setHasOrderChanges(false);
      showSuccessToast('Ordem salva com sucesso');
    } catch (err) {
      console.error('Erro ao salvar ordem:', err);
      showErrorToast(err instanceof Error ? err.message : 'Erro ao salvar ordem');
    }
  };

  // Cancelar mudanças de ordem
  const handleCancelOrder = () => {
    // Recarregar tutoriais do servidor
    const fetchTutorials = async () => {
      try {
        const response = await fetch('/api/tutorials/sections');
        if (response.ok) {
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
          
          const sections: TutorialSection[] = (data.sections as ApiSection[]).map((section) => ({
            id: section.id,
            title: section.title,
            order: section.order || 0,
            videos: section.videos.map((video) => ({
              id: video.id,
              title: video.title,
              videoId: video.videoId,
              order: video.order || 0,
            })),
          }));
          setTutorialSections(sections);
          setHasOrderChanges(false);
        }
      } catch (err) {
        console.error('Erro ao recarregar tutoriais:', err);
      }
    };
    fetchTutorials();
  };

  // Mostrar loading
  if (isLoading) {
    return <TutorialsSkeleton showAddButton={true} />;
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Busca */}
          <div className="flex-1 sm:max-w-md">
            <Search
              placeholder="Pesquisar tutoriais... (ex: keyauth, mercado pago, loja)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Botão de adicionar sessão */}
          <Button
            variant="secondary"
            onClick={() => {
              setEditingSectionId(null);
              setEditingSectionName('');
              setIsSectionModalOpen(true);
            }}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            Nova sessão
          </Button>
          {/* Botões de salvar/cancelar ordem */}
          {hasOrderChanges && (
            <>
              <Button
                variant="secondary"
                onClick={handleCancelOrder}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveOrder}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                Salvar ordem
              </Button>
            </>
          )}
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
                {/* Título da seção com botões de ação */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {/* Botões de reordenar seção (vertical) */}
                    <div className="flex gap-1">
                      <IconOnlyButton
                        icon={ChevronUp}
                        onClick={() => handleMoveSectionUp(section.id)}
                        variant="surface"
                        className="w-8 h-8"
                        aria-label="Mover seção para cima"
                        disabled={index === 0}
                      />
                      <IconOnlyButton
                        icon={ChevronDown}
                        onClick={() => handleMoveSectionDown(section.id)}
                        variant="surface"
                        className="w-8 h-8"
                        aria-label="Mover seção para baixo"
                        disabled={index === filteredSections.length - 1}
                      />
                    </div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">
                      {section.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botões de editar/excluir seção */}
                    <IconOnlyButton
                      icon={Edit}
                      onClick={() => handleEditSection(section.id)}
                      variant="surface"
                      className="w-10 h-10"
                      aria-label="Editar sessão"
                    />
                    <IconOnlyButton
                      icon={Trash2}
                      onClick={() => handleDeleteSection(section.id)}
                      variant="surface"
                      className="w-10 h-10 text-red-600 hover:text-red-700"
                      aria-label="Excluir sessão"
                    />
                    <Button
                      variant="primary"
                      onClick={() => handleOpenVideoModal(section.id)}
                      className="flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Adicionar vídeo
                    </Button>
                  </div>
                </div>

                {/* Carrossel de vídeos */}
                {section.videos.length > 0 ? (
                  <VideoCarousel 
                    videos={section.videos}
                    sectionId={section.id}
                    onEditVideo={handleEditVideo}
                    onDeleteVideo={handleDeleteVideo}
                    onMoveVideoLeft={handleMoveVideoLeft}
                    onMoveVideoRight={handleMoveVideoRight}
                    showActions={true}
                  />
                ) : (
                  <div className="text-center py-8 text-[var(--on-background)]">
                    Nenhum vídeo nesta sessão ainda
                  </div>
                )}
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
              : 'Ainda não há tutoriais cadastrados. Crie sua primeira sessão para começar.'}
          </p>
        </div>
      )}

      {/* Modal de criar/editar sessão */}
      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setEditingSectionId(null);
          setEditingSectionName('');
        }}
        onSave={handleSaveSection}
        editMode={!!editingSectionId}
        initialName={editingSectionName}
      />

      {/* Modal de adicionar/editar vídeo */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedSectionId(null);
          setEditingVideoId(null);
          setEditingVideoTitle('');
          setEditingVideoVideoId('');
        }}
        onSave={handleSaveVideo}
        editMode={!!editingVideoId}
        initialTitle={editingVideoTitle}
        initialVideoId={editingVideoVideoId}
      />

      {/* Modal de excluir sessão */}
      <DeleteSectionModal
        isOpen={isDeleteSectionModalOpen}
        onClose={() => {
          setIsDeleteSectionModalOpen(false);
          setDeletingSectionId(null);
          setDeletingSectionName('');
        }}
        onConfirm={handleConfirmDeleteSection}
        sectionName={deletingSectionName}
      />

      {/* Modal de excluir vídeo */}
      <DeleteVideoModal
        isOpen={isDeleteVideoModalOpen}
        onClose={() => {
          setIsDeleteVideoModalOpen(false);
          setDeletingVideoId(null);
          setDeletingVideoName('');
          setSelectedSectionId(null);
        }}
        onConfirm={handleConfirmDeleteVideo}
        videoName={deletingVideoName}
      />
    </div>
  );
}
