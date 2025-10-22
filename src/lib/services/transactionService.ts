import { prisma } from '../prisma';
import { Transaction, TransactionType, TransactionStatus, OrderStatus } from '../types';

// ===========================================
// TRANSACTION SERVICE
// ===========================================

export class TransactionService {
  // Criar transação
  static async createTransaction(data: {
    type: TransactionType;
    amount: number;
    description?: string;
    sellerAmount: number;
    platformAmount: number;
    commissionRate: number;
    gatewayTransactionId?: string;
    gatewayResponse?: string;
    splitTransactionId?: string;
    orderId: string;
    customerId: string;
    storeId: string;
  }) {
    return await prisma.transaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        status: TransactionStatus.PENDING,
        description: data.description,
        sellerAmount: data.sellerAmount,
        platformAmount: data.platformAmount,
        commissionRate: data.commissionRate,
        gatewayTransactionId: data.gatewayTransactionId,
        gatewayResponse: data.gatewayResponse,
        splitTransactionId: data.splitTransactionId,
        orderId: data.orderId,
        customerId: data.customerId,
        storeId: data.storeId,
      },
      include: {
        order: true,
        customer: true,
        store: true,
      },
    });
  }

  // Atualizar status da transação
  static async updateTransactionStatus(id: string, status: TransactionStatus) {
    return await prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  // Buscar transação por ID
  static async getTransactionById(id: string) {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        order: true,
        customer: true,
        store: true,
      },
    });
  }

  // Listar transações da loja
  static async getTransactionsByStore(storeId: string, type?: TransactionType) {
    return await prisma.transaction.findMany({
      where: {
        storeId,
        ...(type && { type }),
      },
      include: {
        order: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Listar transações do cliente
  static async getTransactionsByCustomer(customerId: string) {
    return await prisma.transaction.findMany({
      where: { customerId },
      include: {
        order: true,
        store: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ===========================================
  // PAYMENT PROCESSING
  // ===========================================

  // Processar pagamento de pedido
  static async processOrderPayment(orderId: string, paymentData: {
    gatewayTransactionId: string;
    gatewayResponse: string;
    splitTransactionId?: string;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) throw new Error('Pedido não encontrado');

    // Calcular valores
    const commissionRate = 0.07; // 7%
    const platformAmount = order.totalAmount * commissionRate;
    const sellerAmount = order.totalAmount - platformAmount;

    // Criar transação
    const transaction = await this.createTransaction({
      type: TransactionType.SALE,
      amount: order.totalAmount,
      description: `Pagamento do pedido ${order.orderNumber}`,
      sellerAmount,
      platformAmount,
      commissionRate,
      gatewayTransactionId: paymentData.gatewayTransactionId,
      gatewayResponse: paymentData.gatewayResponse,
      splitTransactionId: paymentData.splitTransactionId,
      orderId,
      customerId: order.customerId || '',
      storeId: order.storeId,
    });

    // Atualizar status do pedido
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });

    // Marcar transação como completa
    await this.updateTransactionStatus(transaction.id, TransactionStatus.COMPLETED);

    return transaction;
  }

  // Processar reembolso
  static async processRefund(orderId: string, refundAmount: number, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error('Pedido não encontrado');

    // Calcular valores do reembolso
    const commissionRate = 0.07;
    const platformRefund = refundAmount * commissionRate;
    const sellerRefund = refundAmount - platformRefund;

    // Criar transação de reembolso
    const refundTransaction = await this.createTransaction({
      type: TransactionType.REFUND,
      amount: -refundAmount, // Valor negativo para reembolso
      description: reason || `Reembolso do pedido ${order.orderNumber}`,
      sellerAmount: -sellerRefund,
      platformAmount: -platformRefund,
      commissionRate,
      orderId,
      customerId: order.customerId || '',
      storeId: order.storeId,
    });

    // Marcar como completa
    await this.updateTransactionStatus(refundTransaction.id, TransactionStatus.COMPLETED);

    return refundTransaction;
  }

  // ===========================================
  // ANALYTICS
  // ===========================================

  // Obter estatísticas financeiras da loja
  static async getStoreFinancialStats(storeId: string, startDate?: Date, endDate?: Date) {
    const whereClause: { storeId: string; status: TransactionStatus; createdAt?: { gte?: Date; lte?: Date } } = { 
      storeId,
      status: TransactionStatus.COMPLETED,
    };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [sales, refunds, totalRevenue, totalCommissions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...whereClause, type: TransactionType.SALE },
        _sum: { amount: true, sellerAmount: true, platformAmount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...whereClause, type: TransactionType.REFUND },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...whereClause, type: TransactionType.SALE },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...whereClause, type: TransactionType.SALE },
        _sum: { platformAmount: true },
      }),
    ]);

    return {
      totalSales: sales._count,
      totalRefunds: refunds._count,
      grossRevenue: sales._sum.amount || 0,
      netRevenue: sales._sum.sellerAmount || 0,
      totalCommissions: sales._sum.platformAmount || 0,
      refundAmount: Math.abs(refunds._sum.amount || 0),
    };
  }

  // Obter estatísticas da plataforma
  static async getPlatformStats(startDate?: Date, endDate?: Date) {
    const whereClause: { status: TransactionStatus; createdAt?: { gte?: Date; lte?: Date } } = { 
      status: TransactionStatus.COMPLETED,
    };
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [totalTransactions, totalCommissions, totalRevenue] = await Promise.all([
      prisma.transaction.count({ where: whereClause }),
      prisma.transaction.aggregate({
        where: { ...whereClause, type: TransactionType.SALE },
        _sum: { platformAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...whereClause, type: TransactionType.SALE },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalTransactions,
      totalCommissions: totalCommissions._sum.platformAmount || 0,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
