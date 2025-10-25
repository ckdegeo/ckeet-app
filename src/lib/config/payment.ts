// Configurações de pagamento e comissões da plataforma

export const PAYMENT_CONFIG = {
  // Taxas da plataforma (master)
  PLATFORM_COMMISSION_RATE: parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.0599'), // 5.99%
  PLATFORM_FIXED_FEE: parseFloat(process.env.PLATFORM_FIXED_FEE || '0.50'), // R$ 0,50
  
  // Configurações do Mercado Pago
  MERCADOPAGO_CLIENT_ID: process.env.MERCADOPAGO_CLIENT_ID,
  MERCADOPAGO_CLIENT_SECRET: process.env.MERCADOPAGO_CLIENT_SECRET,
  MERCADOPAGO_REDIRECT_URI: process.env.MERCADOPAGO_REDIRECT_URI,
  
  // URLs da aplicação
  APP_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // Configurações de PIX
  PIX_EXPIRATION_MINUTES: 30, // PIX expira em 30 minutos
  
  // Configurações de entrega
  DELIVERY_EXPIRATION_DAYS: 7, // Links de download expiram em 7 dias
} as const;

// Validação das variáveis obrigatórias
export function validatePaymentConfig() {
  const required = [
    'MERCADOPAGO_CLIENT_ID',
    'MERCADOPAGO_CLIENT_SECRET',
    'MERCADOPAGO_REDIRECT_URI'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}`);
  }
}

// Função para calcular split payment
export function calculateSplitPayment(amount: number) {
  const commission = (amount * PAYMENT_CONFIG.PLATFORM_COMMISSION_RATE) + PAYMENT_CONFIG.PLATFORM_FIXED_FEE;
  const sellerAmount = amount - commission;
  
  return {
    totalAmount: amount,
    sellerAmount,
    platformAmount: commission,
    commissionRate: PAYMENT_CONFIG.PLATFORM_COMMISSION_RATE,
    commissionFixedFee: PAYMENT_CONFIG.PLATFORM_FIXED_FEE
  };
}
