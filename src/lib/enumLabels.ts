// ===========================================
// LABELS PARA ENUMS
// ===========================================

import { StockType, OrderStatus, PaymentMethod, PaymentStatus, CustomerStatus } from './types';

export const STOCK_TYPE_LABELS: Record<StockType, string> = {
  [StockType.LINE]: 'Por Linha',
  [StockType.FIXED]: 'Fixo',
  [StockType.KEYAUTH]: 'KeyAuth'
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendente',
  [OrderStatus.PAID]: 'Pago',
  [OrderStatus.DELIVERED]: 'Entregue',
  [OrderStatus.CANCELLED]: 'Cancelado',
  [OrderStatus.REFUNDED]: 'Reembolsado'
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CREDIT_CARD]: 'Cartão de Crédito',
  [PaymentMethod.DEBIT_CARD]: 'Cartão de Débito',
  [PaymentMethod.PIX]: 'PIX',
  [PaymentMethod.BOLETO]: 'Boleto',
  [PaymentMethod.TRANSFER]: 'Transferência'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Pendente',
  [PaymentStatus.PAID]: 'Pago',
  [PaymentStatus.FAILED]: 'Falhou',
  [PaymentStatus.REFUNDED]: 'Reembolsado'
};

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  [CustomerStatus.ACTIVE]: 'Ativo',
  [CustomerStatus.BANNED]: 'Banido'
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

export const getStockTypeLabel = (type: StockType): string => {
  return STOCK_TYPE_LABELS[type];
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_LABELS[status];
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  return PAYMENT_METHOD_LABELS[method];
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  return PAYMENT_STATUS_LABELS[status];
};

export const getCustomerStatusLabel = (status: CustomerStatus): string => {
  return CUSTOMER_STATUS_LABELS[status];
};
