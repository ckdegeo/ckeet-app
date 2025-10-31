import { NextRequest } from 'next/server';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { ProductService } from '@/lib/services/productService';
import { StockType } from '@/lib/types';
import { prisma } from '@/lib/prisma';

// GET /api/master/catalog/products
export async function GET(request: NextRequest) {
  return withMasterAuth(request, async (req) => {
    const { searchParams } = new URL(req.url);
    const catalogCategoryId = searchParams.get('catalogCategoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam === null ? true : isActiveParam !== 'false';

    const products = await ProductService.getCatalogProducts({ catalogCategoryId, search, isActive });
    return AuthMiddleware.createSuccessResponse({ products });
  });
}

// POST /api/master/catalog/products
export async function POST(request: NextRequest) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();

      // Validações: produto de catálogo não pode ter storeId/categoryId
      if (body.storeId || body.categoryId) {
        return AuthMiddleware.createErrorResponse('Produtos de catálogo não podem possuir storeId/categoryId', 400);
      }
      if (!body.catalogCategoryId) {
        return AuthMiddleware.createErrorResponse('catalogCategoryId é obrigatório para produtos de catálogo', 400);
      }
      if (!body.name || typeof body.price !== 'number') {
        return AuthMiddleware.createErrorResponse('Campos obrigatórios ausentes: name, price', 400);
      }

      // Validações de segurança
      if (typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.length > 200) {
        return AuthMiddleware.createErrorResponse('Nome inválido (máximo 200 caracteres)', 400);
      }

      if (body.price <= 0 || body.price > 999999.99 || !isFinite(body.price)) {
        return AuthMiddleware.createErrorResponse('Preço inválido (deve estar entre R$ 0,01 e R$ 999.999,99)', 400);
      }

      if (body.description && (typeof body.description !== 'string' || body.description.length > 5000)) {
        return AuthMiddleware.createErrorResponse('Descrição inválida (máximo 5000 caracteres)', 400);
      }

      // Validar catalogCategoryId existe e está ativo
      const catalogCategory = await prisma.catalogCategory.findUnique({
        where: { id: body.catalogCategoryId },
        select: { id: true, isActive: true }
      });
      if (!catalogCategory || !catalogCategory.isActive) {
        return AuthMiddleware.createErrorResponse('Categoria do catálogo não encontrada ou inativa', 404);
      }

      // Validar limites de arrays
      if (body.stockLines && (!Array.isArray(body.stockLines) || body.stockLines.length > 10000)) {
        return AuthMiddleware.createErrorResponse('Limite de linhas de estoque excedido (máximo 10000)', 400);
      }

      if (body.deliverables && (!Array.isArray(body.deliverables) || body.deliverables.length > 100)) {
        return AuthMiddleware.createErrorResponse('Limite de entregáveis excedido (máximo 100)', 400);
      }

      // Validar tamanho de cada linha de estoque
      if (body.stockLines && Array.isArray(body.stockLines)) {
        for (const line of body.stockLines) {
          if (!line.content || typeof line.content !== 'string' || line.content.trim().length === 0 || line.content.length > 1000) {
            return AuthMiddleware.createErrorResponse('Linha de estoque inválida (máximo 1000 caracteres por linha)', 400);
          }
        }
      }

      // Validar entregáveis
      if (body.deliverables && Array.isArray(body.deliverables)) {
        for (const deliverable of body.deliverables) {
          if (!deliverable.name || typeof deliverable.name !== 'string' || deliverable.name.trim().length === 0 || deliverable.name.length > 200) {
            return AuthMiddleware.createErrorResponse('Nome de entregável inválido (máximo 200 caracteres)', 400);
          }
          if (!deliverable.url || typeof deliverable.url !== 'string' || deliverable.url.trim().length === 0 || deliverable.url.length > 2000) {
            return AuthMiddleware.createErrorResponse('URL de entregável inválida (máximo 2000 caracteres)', 400);
          }
          // Validar formato de URL
          try {
            new URL(deliverable.url.trim());
          } catch {
            return AuthMiddleware.createErrorResponse('URL de entregável inválida (formato incorreto)', 400);
          }
        }
      }

      const product = await prisma.$transaction(async (tx) => {
        // Criar o produto
        const createdProduct = await tx.product.create({
          data: {
            name: body.name.trim(),
            description: body.description?.trim() || null,
            price: body.price,
            imageUrl: body.imageUrl,
            image2Url: body.image2Url,
            image3Url: body.image3Url,
            videoUrl: body.videoUrl,
            stockType: (body.stockType as StockType) || StockType.LINE,
            fixedContent: body.fixedContent,
            keyAuthDays: body.keyAuthDays,
            keyAuthSellerKey: body.keyAuthSellerKey,
            isCatalog: true,
            catalogCategoryId: body.catalogCategoryId,
            storeId: null,
            categoryId: null,
          },
        });

        // Criar linhas de estoque se fornecidas
        if (body.stockLines && Array.isArray(body.stockLines) && body.stockLines.length > 0) {
          await tx.stockLine.createMany({
            data: body.stockLines.map((line: { content: string }) => ({
              content: line.content.trim(),
              productId: createdProduct.id,
            })),
          });
        }

        // Criar entregáveis se fornecidos
        if (body.deliverables && Array.isArray(body.deliverables) && body.deliverables.length > 0) {
          await tx.deliverable.createMany({
            data: body.deliverables.map((deliverable: { name: string; url: string }) => ({
              name: deliverable.name.trim(),
              url: deliverable.url.trim(),
              productId: createdProduct.id,
            })),
          });
        }

        return createdProduct;
      });

      return AuthMiddleware.createSuccessResponse({ product }, 'Produto de catálogo criado com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar produto';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}


