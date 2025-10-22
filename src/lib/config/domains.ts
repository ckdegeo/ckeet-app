// Configuração de domínios da plataforma
export const DOMAIN_CONFIG = {
  // Domínio base atual (será migrado para ckeet.store)
  BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN || 'ckeet.vercel.app',
  
  // Domínio futuro
  FUTURE_DOMAIN: 'ckeet.store',
  
  // URL completa do site
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://ckeet.vercel.app',
  
  // Prefixo para lojas
  STORE_SUBDOMAIN_SUFFIX: '.ckeet.vercel.app', // Será '.ckeet.store' no futuro
} as const;

// Helper para gerar URL completa da loja
export function getStoreUrl(subdomain: string): string {
  return `https://${subdomain}${DOMAIN_CONFIG.STORE_SUBDOMAIN_SUFFIX}`;
}

// Helper para validar subdomínio
export function isValidSubdomain(subdomain: string): boolean {
  // Regex: apenas letras minúsculas, números e hífen
  // Não pode começar ou terminar com hífen
  // Mínimo 3 caracteres, máximo 63 caracteres
  const regex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
  return regex.test(subdomain);
}

// Lista de subdomínios reservados
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'app',
  'admin',
  'dashboard',
  'seller',
  'customer',
  'master',
  'auth',
  'login',
  'register',
  'shop',
  'store',
  'payment',
  'checkout',
  'support',
  'help',
  'docs',
  'blog',
  'mail',
  'email',
  'ftp',
  'static',
  'cdn',
  'assets',
  'files',
  'upload',
  'download',
];

// Verificar se subdomínio está reservado
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}

