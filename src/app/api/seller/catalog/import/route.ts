import { NextRequest } from 'next/server';
import { withSellerAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { ProductService } from '@/lib/services/productService';
import { checkRateLimit } from '@/lib/utils/rateLimit';

// POST /api/seller/catalog/import
// body: { sourceProductId: string, targetCategoryId: string }
export async function POST(request: NextRequest) {
  return withSellerAuth(request, async (req, user) => {
    try {
      // Rate limiting: 30 importações por seller a cada 10 minutos
      const identifier = `seller:${user.id}`;
      const rateLimit = checkRateLimit(`catalog-import:${identifier}`, {
        maxRequests: 30,
        windowMs: 10 * 60 * 1000, // 10 minutos
      });

      if (!rateLimit.allowed) {
        return AuthMiddleware.createErrorResponse(
          `Muitas tentativas de importação. Aguarde alguns minutos antes de tentar novamente.`,
          429
        );
      }

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

      // Validar se sourceProductId é produto do catálogo válido
      const sourceProduct = await prisma.product.findUnique({
        where: { id: sourceProductId },
        select: { id: true, isCatalog: true, isActive: true }
      });
      if (!sourceProduct || !sourceProduct.isCatalog || !sourceProduct.isActive) {
        return AuthMiddleware.createErrorResponse('Produto de catálogo inválido ou inativo', 404);
      }

      // Validar se targetCategoryId pertence à loja do seller
      const targetCategory = await prisma.category.findFirst({
        where: {
          id: targetCategoryId,
          storeId: seller.store.id,
          isActive: true
        },
        select: { id: true }
      });
      if (!targetCategory) {
        return AuthMiddleware.createErrorResponse('Categoria de destino não encontrada ou não pertence à sua loja', 404);
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


