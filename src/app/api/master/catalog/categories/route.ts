import { NextRequest } from 'next/server';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { CatalogService } from '@/lib/services/catalogService';

// GET /api/master/catalog/categories
export async function GET(request: NextRequest) {
  return withMasterAuth(request, async () => {
    const categories = await CatalogService.listCategories();
    return AuthMiddleware.createSuccessResponse({ categories });
  });
}

// POST /api/master/catalog/categories
export async function POST(request: NextRequest) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();
      if (!body.name || typeof body.name !== 'string') {
        return AuthMiddleware.createErrorResponse('Nome é obrigatório', 400);
      }
      const category = await CatalogService.createCategory(body.name.trim());
      return AuthMiddleware.createSuccessResponse({ category }, 'Categoria criada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar categoria';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}


