import { NextRequest } from 'next/server';
import { withSellerAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { ProductService } from '@/lib/services/productService';
import { Product } from '@prisma/client';

// POST /api/seller/catalog/import/category
// body: { catalogCategoryId: string, targetCategoryId: string }
export async function POST(request: NextRequest) {
  return withSellerAuth(request, async (req, user) => {
    try {
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

      // Se não veio categoria destino, criar/reusar automaticamente baseado no nome da categoria do catálogo
      if (!targetCategoryId) {
        const catalogCategory = await prisma.catalogCategory.findUnique({
          where: { id: catalogCategoryId },
          select: { name: true },
        });
        const suggestedName = catalogCategory?.name ? `${catalogCategory.name} (Catálogo)` : 'Catálogo';
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


