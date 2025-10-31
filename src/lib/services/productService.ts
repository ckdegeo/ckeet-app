import { prisma } from '../prisma';
import { StockType } from '../types';

// ===========================================
// PRODUCT SERVICE
// ===========================================

export class ProductService {
  // Clonar produto de catálogo para loja do seller
  static async importCatalogProduct(params: {
    sourceProductId: string;
    storeId: string;
    targetCategoryId: string;
    moveIfExists?: boolean;
  }) {
    // Evitar duplicidade: se já existir ResellListing para este storeId+sourceProductId, não importar novamente
    const existingListing = await prisma.resellListing.findFirst({
      where: { storeId: params.storeId, sourceProductId: params.sourceProductId },
    });
    if (existingListing) {
      if (existingListing.isActive) {
        // Verificar se o produto importado correspondente ainda existe e está ativo
        const sourceData = await prisma.product.findUnique({
          where: { id: params.sourceProductId },
          select: { name: true, price: true },
        });
        
        let importedProductExistsAndActive = false;
        if (sourceData) {
          const importedProduct = await prisma.product.findFirst({
            where: {
              storeId: params.storeId,
              isCatalog: false,
              isActive: true,
              name: { equals: sourceData.name },
              price: sourceData.price,
            },
            select: { id: true },
            orderBy: { updatedAt: 'desc' },
          });
          importedProductExistsAndActive = !!importedProduct;
        }

        // Se o produto importado não existe ou está inativo, permitir reimportação
        if (!importedProductExistsAndActive) {
          // Deletar o ResellListing órfão e permitir reimportação
          await prisma.resellListing.delete({
            where: { id: existingListing.id },
          });
          // Continuar o fluxo para criar novo produto e listing
        } else {
          // Produto importado existe e está ativo - já importado
          if (params.moveIfExists && sourceData) {
            // tentar mover o produto existente para a categoria destino
            const found = await prisma.product.findFirst({
              where: {
                storeId: params.storeId,
                isCatalog: false,
                isActive: true,
                name: { equals: sourceData.name },
                price: sourceData.price,
              },
              select: { id: true },
              orderBy: { updatedAt: 'desc' },
            });
            if (found) {
              await prisma.product.update({ where: { id: found.id }, data: { categoryId: params.targetCategoryId } });
            }
            // Atualizar também o listing para refletir a categoria destino
            await prisma.resellListing.update({ where: { id: existingListing.id }, data: { categoryId: params.targetCategoryId } });
          }
          return { alreadyImported: true, product: null } as const;
        }
      } else {
        // Foi soft-deleted/arquivado – reativar o vínculo e atualizar categoria destino
        await prisma.resellListing.update({
          where: { id: existingListing.id },
          data: { isActive: true, categoryId: params.targetCategoryId },
        });
      }
    }
    // Buscar produto de catálogo
    const source = await prisma.product.findUnique({ where: { id: params.sourceProductId } });
    if (!source || !source.isCatalog || !source.isActive) {
      throw new Error('Produto de catálogo inválido');
    }

    // Criar produto do seller (clonado com campos públicos)
    const created = await prisma.product.create({
      data: {
        name: source.name,
        description: source.description || '',
        price: source.price,
        imageUrl: source.imageUrl,
        image2Url: source.image2Url,
        image3Url: source.image3Url,
        videoUrl: source.videoUrl,
        stockType: source.stockType, // Sem conteúdo privado
        isActive: true,
        storeId: params.storeId,
        categoryId: params.targetCategoryId,
      },
    });

    // Criar vínculo de revenda (regras de comissão)
    // Verificar se listing ainda existe (pode ter sido deletado acima)
    const listingStillExists = await prisma.resellListing.findFirst({
      where: { storeId: params.storeId, sourceProductId: params.sourceProductId },
    });
    
    // Criar listing apenas se não existir; se já existia e foi reativado acima, manter único
    if (!listingStillExists) {
      await prisma.resellListing.create({
        data: {
          storeId: params.storeId,
          categoryId: params.targetCategoryId,
          sourceProductId: params.sourceProductId,
          order: 0,
          commissionRate: 0.40,
          fixedFee: 0.50,
          isActive: true,
        },
      });
    }

    return { alreadyImported: false, product: created } as const;
  }
  // Criar produto
  static async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    image2Url?: string;
    image3Url?: string;
    videoUrl?: string;
    stockType: StockType;
    fixedContent?: string;
    keyAuthDays?: number;
    keyAuthSellerKey?: string;
    storeId?: string;
    categoryId?: string;
    isCatalog?: boolean;
    catalogCategoryId?: string;
  }) {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        image2Url: data.image2Url,
        image3Url: data.image3Url,
        videoUrl: data.videoUrl,
        stockType: data.stockType,
        fixedContent: data.fixedContent,
        keyAuthDays: data.keyAuthDays,
        keyAuthSellerKey: data.keyAuthSellerKey,
        storeId: data.storeId || null,
        categoryId: data.categoryId || null,
        isCatalog: data.isCatalog ?? false,
        catalogCategoryId: data.catalogCategoryId || null,
      },
      include: {
        stockLines: true,
        deliverables: true,
        category: true,
        store: true,
      },
    });
  }

  // Buscar produto por ID
  static async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        stockLines: true,
        deliverables: true,
        category: true,
        store: true,
      },
    });
  }

  // Listar produtos da loja
  static async getProductsByStore(storeId: string) {
    return await prisma.product.findMany({
      where: { storeId, isCatalog: false },
      include: {
        stockLines: true,
        deliverables: true,
        category: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  // Listar produtos de catálogo (master)
  static async getCatalogProducts(params: { catalogCategoryId?: string; search?: string; isActive?: boolean }) {
    const { catalogCategoryId, search, isActive } = params;
    return await prisma.product.findMany({
      where: {
        isCatalog: true,
        isActive: isActive ?? true,
        catalogCategoryId: catalogCategoryId || undefined,
        AND: search
          ? [
              {
                name: { contains: search, mode: 'insensitive' },
              },
            ]
          : undefined,
      },
      orderBy: { order: 'asc' },
    });
  }

  // Atualizar produto
  static async updateProduct(id: string, data: Record<string, unknown>) {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        stockLines: true,
        deliverables: true,
        category: true,
        store: true,
      },
    });
  }

  // Deletar produto
  static async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  // ===========================================
  // STOCK MANAGEMENT
  // ===========================================

  // Adicionar linha de estoque
  static async addStockLine(productId: string, content: string) {
    return await prisma.stockLine.create({
      data: {
        content,
        productId,
      },
    });
  }

  // Listar linhas de estoque disponíveis
  static async getAvailableStockLines(productId: string) {
    return await prisma.stockLine.findMany({
      where: {
        productId,
        isUsed: false,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Marcar linha como usada
  static async markStockLineAsUsed(stockLineId: string, orderId: string) {
    return await prisma.stockLine.update({
      where: { id: stockLineId },
      data: {
        isUsed: true,
        usedAt: new Date(),
        orderId,
      },
    });
  }

  // ===========================================
  // DELIVERABLES MANAGEMENT
  // ===========================================

  // Adicionar entregável
  static async addDeliverable(productId: string, name: string, url: string) {
    return await prisma.deliverable.create({
      data: {
        name,
        url,
        productId,
      },
    });
  }

  // Listar entregáveis do produto
  static async getDeliverablesByProduct(productId: string) {
    return await prisma.deliverable.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Deletar entregável
  static async deleteDeliverable(id: string) {
    return await prisma.deliverable.delete({
      where: { id },
    });
  }

  // ===========================================
  // STOCK VALIDATION
  // ===========================================

  // Verificar se produto tem estoque disponível
  static async hasAvailableStock(productId: string): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        stockLines: {
          where: { isUsed: false },
        },
      },
    });

    if (!product) return false;

    switch (product.stockType) {
      case StockType.LINE:
        return product.stockLines.length > 0;
      case StockType.FIXED:
        return !!product.fixedContent;
      case StockType.KEYAUTH:
        return !!(product.keyAuthSellerKey && product.keyAuthDays && product.keyAuthDays > 0);
      default:
        return false;
    }
  }

  // Obter próxima linha de estoque disponível
  static async getNextAvailableStockLine(productId: string) {
    return await prisma.stockLine.findFirst({
      where: {
        productId,
        isUsed: false,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
