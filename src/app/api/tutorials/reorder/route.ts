import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';

// POST - Reordenar seções e vídeos (apenas master)
export async function POST(request: NextRequest) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();
      const { sections, videos } = body;

      // Reordenar seções se fornecidas
      if (sections && Array.isArray(sections)) {
        for (const section of sections) {
          if (section.id && section.order !== undefined) {
            await prisma.tutorialSection.update({
              where: { id: section.id },
              data: { order: section.order },
            });
          }
        }
      }

      // Reordenar vídeos se fornecidos
      if (videos && Array.isArray(videos)) {
        for (const video of videos) {
          if (video.id && video.order !== undefined) {
            await prisma.tutorialVideo.update({
              where: { id: video.id },
              data: { order: video.order },
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Ordem atualizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao reordenar tutoriais:', error);
      const message = error instanceof Error ? error.message : 'Erro ao reordenar';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

