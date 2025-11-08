import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';

// PUT - Editar vídeo (apenas master)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withMasterAuth(request, async (req) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const { title, videoId, order } = body;

      if (!title || !title.trim() || !videoId || !videoId.trim()) {
        return AuthMiddleware.createErrorResponse('Título e videoId são obrigatórios', 400);
      }

      // Verificar se o vídeo existe
      const existingVideo = await prisma.tutorialVideo.findUnique({
        where: { id },
      });

      if (!existingVideo) {
        return AuthMiddleware.createErrorResponse('Vídeo não encontrado', 404);
      }

      const video = await prisma.tutorialVideo.update({
        where: { id },
        data: {
          title: title.trim(),
          videoId: videoId.trim(),
          ...(order !== undefined && { order }),
        },
      });

      return NextResponse.json({
        success: true,
        video,
        message: 'Vídeo atualizado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar vídeo de tutorial:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar vídeo';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

// DELETE - Excluir vídeo (apenas master) - soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withMasterAuth(request, async () => {
    try {
      const { id } = await params;

      // Verificar se o vídeo existe
      const existingVideo = await prisma.tutorialVideo.findUnique({
        where: { id },
      });

      if (!existingVideo) {
        return AuthMiddleware.createErrorResponse('Vídeo não encontrado', 404);
      }

      // Soft delete - desativar vídeo
      await prisma.tutorialVideo.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Vídeo excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir vídeo de tutorial:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir vídeo';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

