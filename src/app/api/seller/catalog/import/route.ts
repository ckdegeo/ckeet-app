import { NextRequest } from 'next/server';
import { withSellerAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { ProductService } from '@/lib/services/productService';

// POST /api/seller/catalog/import
// body: { sourceProductId: string, targetCategoryId: string }
export async function POST(request: NextRequest) {
  return withSellerAuth(request, async (req, user) => {
    try {
      const body = await req.json();
      const { sourceProductId, targetCategoryId } = body || {};
      if (!sourceProductId || !targetCategoryId) {
        return AuthMiddleware.createErrorResponse('Parâmetros inválidos', 400);
      }

      // Obter storeId do seller
      const seller = await prisma.seller.findUnique({
        where: { id: user.id },
        include: { store: true },
      });
      if (!seller?.store?.id) {
        return AuthMiddleware.createErrorResponse('Loja não encontrada para o seller', 400);
      }

      const result = await ProductService.importCatalogProduct({
        sourceProductId,
        storeId: seller.store.id,
        targetCategoryId,
      });
      if (result.alreadyImported) {
        return AuthMiddleware.createSuccessResponse({ alreadyImported: true }, 'Produto já importado anteriormente');
      }
      return AuthMiddleware.createSuccessResponse({ product: result.product }, 'Produto importado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao importar produto';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}


