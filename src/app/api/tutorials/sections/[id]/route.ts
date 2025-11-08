import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';

// PUT - Editar seção (apenas master)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withMasterAuth(request, async (req) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const { title, order } = body;

      if (!title || !title.trim()) {
        return AuthMiddleware.createErrorResponse('Título da sessão é obrigatório', 400);
      }

      // Verificar se a seção existe
      const existingSection = await prisma.tutorialSection.findUnique({
        where: { id },
      });

      if (!existingSection) {
        return AuthMiddleware.createErrorResponse('Seção não encontrada', 404);
      }

      const section = await prisma.tutorialSection.update({
        where: { id },
        data: {
          title: title.trim(),
          ...(order !== undefined && { order }),
        },
        include: {
          videos: true,
        },
      });

      return NextResponse.json({
        success: true,
        section,
        message: 'Sessão atualizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao atualizar seção de tutorial:', error);
      const message = error instanceof Error ? error.message : 'Erro ao atualizar seção';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

// DELETE - Excluir seção (apenas master) - soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withMasterAuth(request, async () => {
    try {
      const { id } = await params;

      // Verificar se a seção existe
      const existingSection = await prisma.tutorialSection.findUnique({
        where: { id },
      });

      if (!existingSection) {
        return AuthMiddleware.createErrorResponse('Seção não encontrada', 404);
      }

      // Soft delete - desativar seção e seus vídeos
      await prisma.tutorialSection.update({
        where: { id },
        data: {
          isActive: false,
          videos: {
            updateMany: {
              where: { sectionId: id },
              data: { isActive: false },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Sessão excluída com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir seção de tutorial:', error);
      const message = error instanceof Error ? error.message : 'Erro ao excluir seção';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

