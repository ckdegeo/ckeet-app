import { NextRequest } from 'next/server';
import { withSellerAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { ProductService } from '@/lib/services/productService';
import { Product } from '@prisma/client';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';

// POST /api/seller/catalog/import/category
// body: { catalogCategoryId: string, targetCategoryId: string }
export async function POST(request: NextRequest) {
  return withSellerAuth(request, async (req, user) => {
    try {
      // Rate limiting: 10 importações de categoria por seller a cada 10 minutos
      const identifier = `seller:${user.id}`;
      const rateLimit = checkRateLimit(`catalog-import-category:${identifier}`, {
        maxRequests: 10,
        windowMs: 10 * 60 * 1000, // 10 minutos
      });

      if (!rateLimit.allowed) {
        const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
        return AuthMiddleware.createErrorResponse(
          `Muitas tentativas de importação. Aguarde alguns minutos antes de tentar novamente.`,
          429
        );
      }

      const body = await req.json();
      let { catalogCategoryId, targetCategoryId } = body || {};
      if (!catalogCategoryId) {
        return AuthMiddleware.createErrorResponse('Parâmetros inválidos', 400);
      }

      const seller = await prisma.seller.findUnique({
        where: { id: user.id },
        include: { store: true },
      });
      if (!seller?.store?.id) {
        return AuthMiddleware.createErrorResponse('Loja não encontrada para o seller', 400);
      }

      // Validar se catalogCategoryId existe e está ativo
      const catalogCategory = await prisma.catalogCategory.findUnique({
        where: { id: catalogCategoryId },
        select: { id: true, name: true, isActive: true },
      });
      if (!catalogCategory || !catalogCategory.isActive) {
        return AuthMiddleware.createErrorResponse('Categoria do catálogo não encontrada ou inativa', 404);
      }

      // Se não veio categoria destino, criar/reusar automaticamente baseado no nome da categoria do catálogo
      if (!targetCategoryId) {
        const suggestedName = catalogCategory.name ? `${catalogCategory.name} (Catálogo)` : 'Catálogo';
        // Reutilizar categoria com mesmo nome (case-insensitive) se já existir
        const existingCategory = await prisma.category.findFirst({
          where: {
            storeId: seller.store.id,
            name: { equals: suggestedName, mode: 'insensitive' },
          },
          select: { id: true },
        });
        if (existingCategory) {
          targetCategoryId = existingCategory.id;
        } else {
          const last = await prisma.category.findFirst({
            where: { storeId: seller.store.id },
            orderBy: { order: 'desc' },
            select: { order: true },
          });
          const createdCategory = await prisma.category.create({
            data: {
              name: suggestedName,
              order: (last?.order || 0) + 1,
              isActive: true,
              storeId: seller.store.id,
            },
            select: { id: true },
          });
          targetCategoryId = createdCategory.id;
        }
      } else {
        // Validar se targetCategoryId (se fornecido) pertence à loja do seller
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
      }

      // Buscar produtos do catálogo nesta categoria
      const sources = await prisma.product.findMany({
        where: { isCatalog: true, isActive: true, catalogCategoryId },
        select: { id: true },
      });

      let imported = 0;
      let skipped = 0;
      for (const s of sources) {
        try {
          const r = await ProductService.importCatalogProduct({
            sourceProductId: s.id,
            storeId: seller.store.id,
            targetCategoryId,
            moveIfExists: true,
          });
          if (r.alreadyImported) skipped += 1; else imported += 1;
        } catch {
          skipped += 1;
        }
      }

      return AuthMiddleware.createSuccessResponse({ imported, skipped }, 'Categoria importada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao importar categoria';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}


