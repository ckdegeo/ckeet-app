import { NextRequest } from 'next/server';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { CatalogService } from '@/lib/services/catalogService';

// POST /api/master/catalog/categories/reorder
// body: { items: [{ id: string, order: number }] }
export async function POST(request: NextRequest) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();
      const items = Array.isArray(body?.items) ? body.items : [];
      if (items.length === 0) {
        return AuthMiddleware.createErrorResponse('Lista de itens inválida', 400);
      }
      await CatalogService.reorderCategories(items);
      return AuthMiddleware.createSuccessResponse({ ok: true }, 'Ordem das categorias atualizada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao reordenar categorias';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}


