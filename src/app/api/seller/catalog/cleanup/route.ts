import { NextRequest } from 'next/server';
import { withSellerAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// POST /api/seller/catalog/cleanup
// body: { catalogCategoryId?: string } - se não fornecer, limpa todos
// ATENÇÃO: Endpoint temporário para testes - remove ResellListing e produtos importados
export async function POST(request: NextRequest) {
  return withSellerAuth(request, async (req, user) => {
    try {
      const body = await req.json();
      const { catalogCategoryId } = body || {};

      const seller = await prisma.seller.findUnique({
        where: { id: user.id },
        include: { store: true },
      });
      if (!seller?.store?.id) {
        return AuthMiddleware.createErrorResponse('Loja não encontrada', 400);
      }

      // Buscar sourceProductIds da categoria do catálogo
      let sourceProductIds: string[] = [];
      if (catalogCategoryId) {
        const catalogProducts = await prisma.product.findMany({
          where: { 
            isCatalog: true, 
            catalogCategoryId,
          },
          select: { id: true },
        });
        sourceProductIds = catalogProducts.map(p => p.id);
      } else {
        // Se não forneceu categoria, limpar todos os imports do seller
        const allCatalogProducts = await prisma.product.findMany({
          where: { isCatalog: true },
          select: { id: true },
        });
        sourceProductIds = allCatalogProducts.map(p => p.id);
      }

      // Deletar ResellListings relacionados (isso libera a reimportação)
      const deletedListings = await prisma.resellListing.deleteMany({
        where: {
          storeId: seller.store.id,
          sourceProductId: { in: sourceProductIds },
        },
      });

      // Buscar produtos do seller que foram importados dessa categoria
      // (identificados por terem sido clonados de sourceProductIds)
      // Abordagem segura: deletar produtos na categoria "(Catálogo)" criada automaticamente
      let deletedProducts = 0;
      if (catalogCategoryId) {
        const catalogCategory = await prisma.catalogCategory.findUnique({
          where: { id: catalogCategoryId },
          select: { name: true },
        });
        
        if (catalogCategory) {
          const categoryNameToMatch = `${catalogCategory.name} (Catálogo)`;
          const category = await prisma.category.findFirst({
            where: {
              storeId: seller.store.id,
              name: { equals: categoryNameToMatch, mode: 'insensitive' },
            },
          });

          if (category) {
            // Deletar todos os produtos dessa categoria que foram importados
            const deleted = await prisma.product.deleteMany({
              where: {
                storeId: seller.store.id,
                categoryId: category.id,
                isCatalog: false,
              },
            });
            deletedProducts = deleted.count;

            // Deletar a categoria também se não tiver mais produtos
            await prisma.category.delete({
              where: { id: category.id },
            });
          }
        }
      }

      return AuthMiddleware.createSuccessResponse(
        { 
          deletedListings: deletedListings.count, 
          deletedProducts 
        }, 
        `Limpeza concluída: ${deletedListings.count} vínculos e ${deletedProducts} produtos removidos`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao limpar imports';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}
