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

      // Validações de segurança
      if (body.name && (typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.length > 200)) {
        return AuthMiddleware.createErrorResponse('Nome inválido (máximo 200 caracteres)', 400);
      }

      if (body.price !== undefined) {
        if (typeof body.price !== 'number' || body.price <= 0 || body.price > 999999.99 || !isFinite(body.price)) {
          return AuthMiddleware.createErrorResponse('Preço inválido (deve estar entre R$ 0,01 e R$ 999.999,99)', 400);
        }
      }

      if (body.description !== undefined && body.description !== null && (typeof body.description !== 'string' || body.description.length > 5000)) {
        return AuthMiddleware.createErrorResponse('Descrição inválida (máximo 5000 caracteres)', 400);
      }

      // Validar limites de arrays
      if (body.stockLines !== undefined && (!Array.isArray(body.stockLines) || body.stockLines.length > 10000)) {
        return AuthMiddleware.createErrorResponse('Limite de linhas de estoque excedido (máximo 10000)', 400);
      }

      if (body.deliverables !== undefined && (!Array.isArray(body.deliverables) || body.deliverables.length > 100)) {
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

      // Validar catalogCategoryId se fornecido
      if (body.catalogCategoryId !== undefined && body.catalogCategoryId !== null) {
        const catalogCategory = await prisma.catalogCategory.findUnique({
          where: { id: body.catalogCategoryId },
          select: { id: true, isActive: true }
        });
        if (!catalogCategory || !catalogCategory.isActive) {
          return AuthMiddleware.createErrorResponse('Categoria do catálogo não encontrada ou inativa', 404);
        }
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


