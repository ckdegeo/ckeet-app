// Utilitários para validação de loja completa

export interface StoreCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export interface StoreData {
  id?: string;
  name?: string;
  contactEmail?: string;
  logoUrl?: string | null;
  homeBannerUrl?: string | null;
  storeBannerUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  subdomain?: string;
}

// Campos obrigatórios para uma loja estar completa
const REQUIRED_FIELDS = [
  'name',
  'contactEmail', 
  'logoUrl',
  'homeBannerUrl',
  'storeBannerUrl'
] as const;

// Labels amigáveis para os campos
const FIELD_LABELS: Record<string, string> = {
  name: 'Nome da loja',
  contactEmail: 'Email de contato',
  logoUrl: 'Logotipo da loja',
  homeBannerUrl: 'Banner da tela inicial',
  storeBannerUrl: 'Banner da loja'
};

/**
 * Verifica se a loja está completa com todos os campos obrigatórios
 */
export function validateStoreCompletion(store: StoreData | null): StoreCompletionStatus {
  if (!store) {
    return {
      isComplete: false,
      missingFields: REQUIRED_FIELDS.map(field => FIELD_LABELS[field]),
      completionPercentage: 0
    };
  }

  const missingFields: string[] = [];
  
  REQUIRED_FIELDS.forEach(field => {
    const value = store[field];
    // Validação mais restritiva - considerar null, undefined, string vazia como incompleto
    if (!value || value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(FIELD_LABELS[field]);
    }
  });

  const completedFields = REQUIRED_FIELDS.length - missingFields.length;
  const completionPercentage = Math.round((completedFields / REQUIRED_FIELDS.length) * 100);

  // Se a loja tem um subdomínio válido, considere como "at least initializable"
  // Isso permite que o seller acesse a página de configuração após criar o domínio
  const hasSubdomain = Boolean(store.subdomain && store.subdomain.trim() !== '');
  
  return {
    isComplete: hasSubdomain && missingFields.length === 0, // Loja completa = tem subdomínio + todos os campos preenchidos
    missingFields,
    completionPercentage
  };
}

/**
 * Verifica se um seller tem loja completa
 */
export async function checkSellerStoreCompletion(sellerId: string): Promise<StoreCompletionStatus> {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: { store: true }
    });

    return validateStoreCompletion(seller?.store || null);
  } catch (error) {
    console.error('Erro ao verificar completude da loja:', error);
    return {
      isComplete: false,
      missingFields: ['Erro ao verificar loja'],
      completionPercentage: 0
    };
  }
}

/**
 * Lista de rotas que exigem loja completa
 * Todas as rotas de seller (exceto auth e store) precisam de loja completa
 */
export const PROTECTED_SELLER_ROUTES = [
  '/seller/dashboard',
  '/seller/products',
  '/seller/sales',
  '/seller/clients',
  '/seller/integrations'
] as const;

/**
 * Rotas que NÃO precisam de loja completa
 */
export const EXCLUDED_SELLER_ROUTES = [
  '/seller/auth',
  '/seller/store'
] as const;

/**
 * Verifica se uma rota precisa de loja completa
 */
export function isProtectedSellerRoute(pathname: string): boolean {
  // Se não é uma rota de seller, não precisa verificar
  if (!pathname.startsWith('/seller/')) {
    return false;
  }

  // Se é uma rota de autenticação, não precisa verificar
  if (pathname.startsWith('/seller/auth/')) {
    return false;
  }

  // Se é a página de configuração da loja, não precisa verificar
  if (pathname === '/seller/store') {
    return false;
  }

  // Todas as outras rotas de seller precisam de loja completa
  return true;
}

/**
 * Rota para onde redirecionar quando loja não está completa
 */
export const STORE_SETUP_ROUTE = '/seller/store';
