// ===========================================
// CONSTANTES DO SISTEMA
// ===========================================

import { StockType } from './types';

// ===========================================
// CONFIGURAÇÕES PADRÃO
// ===========================================

export const DEFAULT_STOCK_TYPE = StockType.LINE;

export const DEFAULT_COMMISSION_RATE = 0.07; // 7%

export const DEFAULT_PRIMARY_COLOR = '#bd253c';

export const MAX_IMAGE_SIZE_MB = 5;

export const MAX_DESCRIPTION_LENGTH = 500;

export const MAX_FIXED_CONTENT_LENGTH = 2000;

// ===========================================
// CONFIGURAÇÕES DE VALIDAÇÃO
// ===========================================

export const MIN_PRODUCT_PRICE = 0.01;

export const MAX_KEYAUTH_DAYS = 3650; // ~10 anos

export const MIN_KEYAUTH_DAYS = 1;

// ===========================================
// CONFIGURAÇÕES DE PAGAMENTO
// ===========================================

export const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'PIX', label: 'PIX' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'TRANSFER', label: 'Transferência' }
] as const;

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAID', label: 'Pago' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUNDED', label: 'Reembolsado' }
] as const;

// ===========================================
// CONFIGURAÇÕES DE ESTOQUE
// ===========================================

export const STOCK_TYPES = [
  { value: 'LINE', label: 'Por Linha', description: 'Cada linha é uma unidade vendável' },
  { value: 'FIXED', label: 'Fixo', description: 'Mesmo conteúdo sempre entregue' },
  { value: 'KEYAUTH', label: 'KeyAuth', description: 'Integração com KeyAuth' }
] as const;

// ===========================================
// CONFIGURAÇÕES DE UPLOAD
// ===========================================

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// ===========================================
// CONFIGURAÇÕES DE DOMÍNIO
// ===========================================

export const DEFAULT_SUBDOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export const RESERVED_SUBDOMAINS = [
  'www', 'admin', 'api', 'app', 'mail', 'ftp', 'blog', 'shop', 'store', 'help', 'support'
];

// ===========================================
// CONFIGURAÇÕES DE PAGINAÇÃO
// ===========================================

export const DEFAULT_ITEMS_PER_PAGE = 20;

export const MAX_ITEMS_PER_PAGE = 100;

// ===========================================
// CONFIGURAÇÕES DE CACHE
// ===========================================

export const CACHE_TTL = {
  PRODUCTS: 300, // 5 minutos
  CATEGORIES: 600, // 10 minutos
  ORDERS: 60, // 1 minuto
  DASHBOARD: 300 // 5 minutos
} as const;
