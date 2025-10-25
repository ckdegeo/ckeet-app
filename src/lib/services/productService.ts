import { prisma } from '../prisma';
import { StockType } from '../types';

// ===========================================
// PRODUCT SERVICE
// ===========================================

export class ProductService {
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
    keyAuthPublicKey?: string;
    keyAuthSellerKey?: string;
    storeId: string;
    categoryId: string;
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
        keyAuthPublicKey: data.keyAuthPublicKey,
        keyAuthSellerKey: data.keyAuthSellerKey,
        storeId: data.storeId,
        categoryId: data.categoryId,
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
      where: { storeId },
      include: {
        stockLines: true,
        deliverables: true,
        category: true,
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
        return !!(product.keyAuthPublicKey && product.keyAuthSellerKey);
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
