import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';

// GET - Buscar todas as seções de tutoriais com vídeos (público - qualquer um pode ver)
export async function GET() {
  try {
    const sections = await prisma.tutorialSection.findMany({
      where: {
        isActive: true,
      },
      include: {
        videos: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      sections: sections || [],
    });
  } catch (error: unknown) {
    console.error('Erro ao buscar seções de tutoriais:', error);
    
    // Se a tabela não existe, retornar array vazio
    const prismaError = error as { code?: string; message?: string };
    if (prismaError?.code === 'P2021' || prismaError?.message?.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        sections: [],
      });
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar tutoriais' },
      { status: 500 }
    );
  }
}

// POST - Criar nova seção (apenas master)
export async function POST(request: NextRequest) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();
      const { title, order } = body;

      if (!title || !title.trim()) {
        return AuthMiddleware.createErrorResponse('Título da sessão é obrigatório', 400);
      }

      const section = await prisma.tutorialSection.create({
        data: {
          title: title.trim(),
          order: order || 0,
          isActive: true,
        },
        include: {
          videos: true,
        },
      });

      return NextResponse.json({
        success: true,
        section,
        message: 'Sessão criada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao criar seção de tutorial:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar seção';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

