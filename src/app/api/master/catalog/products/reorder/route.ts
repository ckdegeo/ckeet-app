import { NextRequest } from 'next/server';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { CatalogService } from '@/lib/services/catalogService';

// POST /api/master/catalog/products/reorder
// body: { catalogCategoryId: string, products: [{ id: string, order: number }] }
export async function POST(request: NextRequest) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();
      const catalogCategoryId = body?.catalogCategoryId as string;
      const products = Array.isArray(body?.products) ? body.products : [];
      if (!catalogCategoryId || products.length === 0) {
        return AuthMiddleware.createErrorResponse('Parâmetros inválidos', 400);
      }
      await CatalogService.reorderCatalogProducts(catalogCategoryId, products);
      return AuthMiddleware.createSuccessResponse({ ok: true }, 'Ordem dos produtos atualizada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao reordenar produtos';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}


