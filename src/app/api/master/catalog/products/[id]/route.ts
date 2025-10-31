import { NextRequest } from 'next/server';
import { withMasterAuth, AuthMiddleware } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// GET /api/master/catalog/products/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withMasterAuth(request, async () => {
    const { id } = await params;
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        stockLines: {
          where: {
            isDeleted: false
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        deliverables: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    if (!product || !product.isCatalog) {
      return AuthMiddleware.createErrorResponse('Produto não encontrado no catálogo', 404);
    }
    return AuthMiddleware.createSuccessResponse({ product });
  });
}

// PUT /api/master/catalog/products/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withMasterAuth(request, async (req) => {
    try {
      const body = await req.json();

      // Garantir que continua sendo de catálogo e sem store/category
      // Buscar produto atual para preservar campos não enviados
      const { id } = await params;
      const current = await prisma.product.findUnique({ where: { id } });
      if (!current || !current.isCatalog) {
        return AuthMiddleware.createErrorResponse('Produto não encontrado no catálogo', 404);
      }

      const data: Record<string, unknown> = { ...body, isCatalog: true };
      data.storeId = null;
      data.categoryId = null;
      // Se não enviar catalogCategoryId, preservar o atual
      if (body.catalogCategoryId === undefined || body.catalogCategoryId === null) {
        data.catalogCategoryId = current.catalogCategoryId;
      }
      // Garantir ativo (a menos que explicitamente enviado como false)
      if (typeof body.isActive === 'undefined') {
        data.isActive = true;
      }

      const product = await prisma.$transaction(async (tx) => {
        // Atualizar produto
        const updatedProduct = await tx.product.update({
          where: { id },
          data,
        });

        if (!updatedProduct.isCatalog) {
          // Reforço de segurança: nunca permitir flipar para não-catálogo
          await tx.product.update({ where: { id }, data: { isCatalog: true } });
        }

        // Atualizar stockLines se fornecidas
        if (body.stockLines !== undefined) {
          // Deletar todas as linhas existentes (soft delete)
          await tx.stockLine.updateMany({
            where: { productId: id, isDeleted: false },
            data: { isDeleted: true }
          });

          // Criar novas linhas se fornecidas
          if (Array.isArray(body.stockLines) && body.stockLines.length > 0) {
            await tx.stockLine.createMany({
              data: body.stockLines.map((line: { content: string }) => ({
                content: line.content.trim(),
                productId: id,
              })),
            });
          }
        }

        // Atualizar deliverables se fornecidos
        if (body.deliverables !== undefined) {
          // Deletar todos os entregáveis existentes
          await tx.deliverable.deleteMany({
            where: { productId: id }
          });

          // Criar novos entregáveis se fornecidos
          if (Array.isArray(body.deliverables) && body.deliverables.length > 0) {
            await tx.deliverable.createMany({
              data: body.deliverables.map((deliverable: { name: string; url: string }) => ({
                name: deliverable.name.trim(),
                url: deliverable.url.trim(),
                productId: id,
              })),
            });
          }
        }

        return updatedProduct;
      });

      return AuthMiddleware.createSuccessResponse({ product }, 'Produto atualizado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar produto';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}

// DELETE (soft) /api/master/catalog/products/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withMasterAuth(request, async () => {
    try {
      const { id } = await params;
      const product = await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return AuthMiddleware.createSuccessResponse({ product }, 'Produto arquivado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir produto';
      return AuthMiddleware.createErrorResponse(message, 500);
    }
  });
}


