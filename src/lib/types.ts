// ===========================================
// TYPES BASEADOS NO SCHEMA PRISMA
// ===========================================

// Enums do Prisma
export enum StockType {
  LINE = 'LINE',
  FIXED = 'FIXED', 
  KEYAUTH = 'KEYAUTH'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  TRANSFER = 'TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum TransactionType {
  SALE = 'SALE',
  REFUND = 'REFUND',
  CHARGEBACK = 'CHARGEBACK'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED'
}

// ===========================================
// INTERFACES BASEADAS NO SCHEMA
// ===========================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  image2Url?: string;
  image3Url?: string;
  videoUrl?: string;
  order: number;
  
  // Stock Configuration
  stockType: StockType;
  
  // Fixed Stock
  fixedContent?: string;
  
  // KeyAuth Integration
  keyAuthDays?: number;
  keyAuthPublicKey?: string;
  keyAuthSellerKey?: string;
  
  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  storeId: string;
  categoryId: string;
  stockLines?: StockLine[];
  deliverables?: Deliverable[];
}

export interface StockLine {
  id: string;
  content: string;
  isUsed: boolean;
  usedAt?: Date;
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
}

export interface Deliverable {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  
  // Customer Info
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  
  // Payment Info
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  storeId: string;
  customerId?: string;
  products?: OrderItem[];
  purchases?: Purchase[];
  transactions?: Transaction[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
}

export interface Purchase {
  id: string;
  deliveredContent?: string;
  stockLineId?: string;
  downloadUrl?: string;
  expiresAt?: Date;
  isDownloaded: boolean;
  downloadCount: number;
  createdAt: Date;
  orderId: string;
  customerId: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description?: string;
  
  // Split Payment Info
  sellerAmount: number;
  platformAmount: number;
  commissionRate: number;
  
  // Payment Gateway Info
  gatewayTransactionId?: string;
  gatewayResponse?: string;
  splitTransactionId?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  orderId: string;
  customerId: string;
  storeId: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  cpf?: string;
  password?: string;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  orders?: Order[];
  purchases?: Purchase[];
  transactions?: Transaction[];
}

export interface Seller {
  id: string;
  email: string;
  name?: string;
  cpf?: string;
  phone?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  store?: Store;
}

export interface Store {
  id: string;
  name: string;
  contactEmail: string;
  description?: string;
  
  // Visual Identity
  logoUrl?: string;
  homeBannerUrl?: string;
  storeBannerUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  
  // Domain Configuration
  subdomain: string;
  
  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  sellerId: string;
  categories?: Category[];
  products?: Product[];
  orders?: Order[];
  transactions?: Transaction[];
}

export interface Category {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  storeId: string;
  products?: Product[];
}

// ===========================================
// TYPES PARA FORMULÁRIOS
// ===========================================

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  videoUrl: string;
  image1: File | { url: string } | null;
  image2: File | { url: string } | null;
  image3: File | { url: string } | null;
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
  stockType: StockType;
  fixedContent?: string;
  keyAuthDays?: number;
  keyAuthPublicKey?: string;
  keyAuthSellerKey?: string;
}

export interface StockLineFormData {
  content: string;
}

export interface DeliverableFormData {
  name: string;
  url: string;
}

// ===========================================
// UTILITY TYPES
// ===========================================

export type StockTypeLabels = {
  [StockType.LINE]: 'Por Linha';
  [StockType.FIXED]: 'Fixo';
  [StockType.KEYAUTH]: 'KeyAuth';
};

export type OrderStatusLabels = {
  [OrderStatus.PENDING]: 'Pendente';
  [OrderStatus.PAID]: 'Pago';
  [OrderStatus.DELIVERED]: 'Entregue';
  [OrderStatus.CANCELLED]: 'Cancelado';
  [OrderStatus.REFUNDED]: 'Reembolsado';
};

export type PaymentMethodLabels = {
  [PaymentMethod.CREDIT_CARD]: 'Cartão de Crédito';
  [PaymentMethod.DEBIT_CARD]: 'Cartão de Débito';
  [PaymentMethod.PIX]: 'PIX';
  [PaymentMethod.BOLETO]: 'Boleto';
  [PaymentMethod.TRANSFER]: 'Transferência';
};

export type PaymentStatusLabels = {
  [PaymentStatus.PENDING]: 'Pendente';
  [PaymentStatus.PAID]: 'Pago';
  [PaymentStatus.FAILED]: 'Falhou';
  [PaymentStatus.REFUNDED]: 'Reembolsado';
};
