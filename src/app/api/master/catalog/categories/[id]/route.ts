import { NextRequest } from 'next/server';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { CatalogService } from '@/lib/services/catalogService';

// GET /api/master/catalog/categories/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withMasterAuth(request, async () => {
    const { id } = await params;
    const category = await CatalogService.getCategoryById(id);
    if (!category || !category.isActive) {
      return AuthMiddleware.createErrorResponse('Categoria não encontrada', 404);
    }
    return AuthMiddleware.createSuccessResponse({ category });
  });
}

// PUT /api/master/catalog/categories/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();
      if (!body.name || typeof body.name !== 'string') {
        return AuthMiddleware.createErrorResponse('Nome é obrigatório', 400);
      }
      const { id } = await params;
      const category = await CatalogService.updateCategory(id, body.name.trim());
      return AuthMiddleware.createSuccessResponse({ category }, 'Categoria atualizada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar categoria';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

// DELETE (soft) /api/master/catalog/categories/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withMasterAuth(request, async () => {
    try {
      const { id } = await params;
      const category = await CatalogService.softDeleteCategory(id);
      return AuthMiddleware.createSuccessResponse({ category }, 'Categoria arquivada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir categoria';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}


