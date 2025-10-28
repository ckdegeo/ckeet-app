import { prisma } from '../prisma';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../types';
import { ProductService as ProductServiceClass } from './productService';

// ===========================================
// ORDER SERVICE
// ===========================================

export class OrderService {
  // Criar pedido
  static async createOrder(data: {
    orderNumber: string;
    totalAmount: number;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: PaymentMethod;
    storeId: string;
    customerId?: string;
    products: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }) {
    return await prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        paymentMethod: data.paymentMethod,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        storeId: data.storeId,
        customerId: data.customerId,
        products: {
          create: data.products.map(item => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                stockLines: true,
                deliverables: true,
              },
            },
          },
        },
        store: true,
        customer: true,
      },
    });
  }

  // Buscar pedido por ID
  static async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                stockLines: true,
                deliverables: true,
              },
            },
          },
        },
        store: true,
        customer: true,
        purchases: true,
        transactions: true,
      },
    });
  }

  // Listar pedidos da loja
  static async getOrdersByStore(storeId: string, status?: OrderStatus) {
    return await prisma.order.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Atualizar status do pedido
  static async updateOrderStatus(id: string, status: OrderStatus) {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });
  }

  // Atualizar status de pagamento
  static async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return await prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });
  }

  // ===========================================
  // ORDER PROCESSING
  // ===========================================

  // Processar entrega do pedido
  static async processOrderDelivery(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Pedido não encontrado');

    const purchases = [];

    for (const orderItem of order.products) {
      const product = orderItem.product;
      
      // Verificar tipo de estoque e processar entrega
      switch (product.stockType) {
        case 'LINE':
          // Buscar próxima linha disponível
          const stockLine = await ProductServiceClass.getNextAvailableStockLine(product.id);
          if (!stockLine) {
            throw new Error(`Produto ${product.name} sem estoque disponível`);
          }

          // Marcar linha como usada
          await ProductServiceClass.markStockLineAsUsed(stockLine.id, orderId);

          // Criar purchase com conteúdo entregue
          const purchase = await prisma.purchase.create({
            data: {
              deliveredContent: stockLine.content,
              stockLineId: stockLine.id,
              orderId,
              customerId: order.customerId || '',
            },
          });
          purchases.push(purchase);
          break;

        case 'FIXED':
          // Entregar conteúdo fixo
          if (!product.fixedContent) {
            throw new Error(`Produto ${product.name} sem conteúdo fixo configurado`);
          }

          const fixedPurchase = await prisma.purchase.create({
            data: {
              deliveredContent: product.fixedContent,
              orderId,
              customerId: order.customerId || '',
            },
          });
          purchases.push(fixedPurchase);
          break;

        case 'KEYAUTH':
          // Gerar chave via KeyAuth API e entregar ao cliente
          if (!product.keyAuthSellerKey || !product.keyAuthDays) {
            throw new Error(`Produto ${product.name} sem configuração KeyAuth`);
          }

          try {
            const url = `https://keyauth.win/api/seller/?sellerkey=${encodeURIComponent(product.keyAuthSellerKey)}&type=add&expiry=${encodeURIComponent(String(product.keyAuthDays))}&mask=******-******-******-******-******-******&level=1&amount=1&format=text`;
            const res = await fetch(url, { method: 'GET' });
            const text = await res.text();
            const generatedKey = text.trim();

            if (!res.ok || !generatedKey) {
              throw new Error('Falha ao gerar chave KeyAuth');
            }

            const keyPurchase = await prisma.purchase.create({
              data: {
                deliveredContent: generatedKey,
                orderId,
                customerId: order.customerId || '',
              },
            });
            purchases.push(keyPurchase);
          } catch (err) {
            throw new Error('Erro ao gerar chave KeyAuth');
          }
          break;
      }
    }

    // Atualizar status do pedido para entregue
    await this.updateOrderStatus(orderId, OrderStatus.DELIVERED);

    return purchases;
  }

  // ===========================================
  // ORDER ANALYTICS
  // ===========================================

  // Obter estatísticas de pedidos da loja
  static async getOrderStats(storeId: string, startDate?: Date, endDate?: Date) {
    const whereClause: { storeId: string; createdAt?: { gte?: Date; lte?: Date } } = { storeId };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [totalOrders, paidOrders, pendingOrders, totalRevenue] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.count({ where: { ...whereClause, status: OrderStatus.PAID } }),
      prisma.order.count({ where: { ...whereClause, status: OrderStatus.PENDING } }),
      prisma.order.aggregate({
        where: { ...whereClause, status: OrderStatus.PAID },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }
}
