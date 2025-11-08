import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';

// POST - Adicionar vídeo a uma seção (apenas master)
export async function POST(request: NextRequest) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();
      const { sectionId, title, videoId, order } = body;

      if (!sectionId || !title || !videoId) {
        return AuthMiddleware.createErrorResponse('sectionId, title e videoId são obrigatórios', 400);
      }

      // Verificar se a seção existe
      const section = await prisma.tutorialSection.findUnique({
        where: { id: sectionId },
      });

      if (!section) {
        return AuthMiddleware.createErrorResponse('Seção não encontrada', 404);
      }

      const video = await prisma.tutorialVideo.create({
        data: {
          title: title.trim(),
          videoId: videoId.trim(),
          sectionId,
          order: order || 0,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        video,
        message: 'Vídeo adicionado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao criar vídeo de tutorial:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar vídeo';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

