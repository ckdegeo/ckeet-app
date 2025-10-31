import { prisma } from '../prisma';

export class CatalogService {
  // Categorias do catálogo
  static async listCategories() {
    return prisma.catalogCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  static async getCategoryById(id: string) {
    return prisma.catalogCategory.findUnique({ where: { id } });
  }

  static async createCategory(name: string) {
    // Descobrir próximo order
    const last = await prisma.catalogCategory.findFirst({ orderBy: { order: 'desc' } });
    const nextOrder = last ? last.order + 1 : 1;
    return prisma.catalogCategory.create({ data: { name, order: nextOrder } });
  }

  static async updateCategory(id: string, name: string) {
    return prisma.catalogCategory.update({ where: { id }, data: { name } });
  }

  static async softDeleteCategory(id: string) {
    return prisma.catalogCategory.update({ where: { id }, data: { isActive: false } });
  }

  static async reorderCategories(items: Array<{ id: string; order: number }>) {
    const tx = items.map((item) =>
      prisma.catalogCategory.update({ where: { id: item.id }, data: { order: item.order } })
    );
    await prisma.$transaction(tx);
    return true;
  }

  // Produtos do catálogo
  static async reorderCatalogProducts(
    catalogCategoryId: string,
    products: Array<{ id: string; order: number }>
  ) {
    // Garantir que todos pertencem ao catálogo e à categoria informada
    const ids = products.map((p) => p.id);
    const existing = await prisma.product.findMany({
      where: { id: { in: ids }, isCatalog: true, catalogCategoryId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((p) => p.id));
    const tx = products
      .filter((p) => existingIds.has(p.id))
      .map((p) => prisma.product.update({ where: { id: p.id }, data: { order: p.order } }));
    await prisma.$transaction(tx);
    return true;
  }
}


