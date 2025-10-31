import { NextRequest, NextResponse } from 'next/server';
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

      const product = await prisma.$transaction(async (tx) => {
        // Criar o produto
        const createdProduct = await tx.product.create({
          data: {
            name: body.name,
            description: body.description,
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


