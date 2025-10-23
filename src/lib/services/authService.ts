import { prisma } from '../prisma';
import { createServerSupabaseClient } from '../supabase';
import { Seller, Store } from '../types';

// ===========================================
// AUTH SERVICE
// ===========================================

export class AuthService {
  // ===========================================
  // SUPABASE AUTH OPERATIONS
  // ===========================================

  // Sincronizar usuário Supabase com Prisma
  static async syncUser(supabaseUser: { id: string; email?: string; user_metadata?: { user_type?: string; name?: string } }) {
    const userType = supabaseUser.user_metadata?.user_type;
    
    if (userType === 'seller') {
      return await this.syncSeller(supabaseUser);
    }
    
    if (userType === 'customer') {
      return await this.syncCustomer(supabaseUser);
    }
    
    throw new Error('Tipo de usuário não reconhecido');
  }

  // Sincronizar Seller
  static async syncSeller(supabaseUser: { id: string; email?: string; user_metadata?: { user_type?: string; name?: string; cpf?: string; phone?: string } }) {
    return await prisma.seller.upsert({
      where: { email: supabaseUser.email || '' },
      update: {
        name: supabaseUser.user_metadata?.name,
        cpf: supabaseUser.user_metadata?.cpf,
        phone: supabaseUser.user_metadata?.phone,
      },
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name,
        cpf: supabaseUser.user_metadata?.cpf,
        phone: supabaseUser.user_metadata?.phone,
        password: '', // Senha gerenciada pelo Supabase
      },
    });
  }

  // Sincronizar Customer
  static async syncCustomer(supabaseUser: { id: string; email?: string; user_metadata?: { user_type?: string; name?: string; phone?: string; sellerId?: string } }) {
    // Como email não é mais único, vamos usar findFirst e create/update manualmente
    const whereClause: { email: string; sellerId?: string } = { 
      email: supabaseUser.email || ''
    };
    
    // Só adiciona sellerId se ele existir
    if (supabaseUser.user_metadata?.sellerId) {
      whereClause.sellerId = supabaseUser.user_metadata.sellerId;
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: whereClause
    });

    if (existingCustomer) {
      return await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: supabaseUser.user_metadata?.name,
          phone: supabaseUser.user_metadata?.phone,
        }
      });
    } else {
      return await prisma.customer.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name,
          phone: supabaseUser.user_metadata?.phone,
          sellerId: supabaseUser.user_metadata?.sellerId || null,
          password: '', // Senha gerenciada pelo Supabase
        }
      });
    }
  }

  // ===========================================
  // SELLER OPERATIONS
  // ===========================================

  // Criar seller
  static async createSeller(data: {
    id: string;
    email: string;
    name: string;
    cpf: string;
    phone: string;
    password?: string; // Opcional, pois Supabase gerencia
  }) {
    return await prisma.seller.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        cpf: data.cpf,
        phone: data.phone,
        password: data.password || '', // Senha gerenciada pelo Supabase
      },
    });
  }

  // Buscar seller por email
  static async getSellerByEmail(email: string) {
    return await prisma.seller.findUnique({
      where: { email },
      include: {
        store: true,
      },
    });
  }

  // Buscar seller por CPF
  static async getSellerByCpf(cpf: string) {
    return await prisma.seller.findUnique({
      where: { cpf },
    });
  }

  // Buscar seller por ID
  static async getSellerById(id: string) {
    return await prisma.seller.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });
  }

  // ===========================================
  // CUSTOMER OPERATIONS
  // ===========================================

  // Criar customer
  static async createCustomer(data: {
    id: string;
    email: string;
    name: string;
    phone: string;
    password?: string; // Opcional, pois Supabase gerencia
  }) {
    return await prisma.customer.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: data.password || '', // Senha gerenciada pelo Supabase
      },
    });
  }

  // Buscar customer por email
  static async getCustomerByEmail(email: string) {
    return await prisma.customer.findFirst({
      where: { email },
    });
  }

  // Buscar customer por ID
  static async getCustomerById(id: string) {
    return await prisma.customer.findUnique({
      where: { id },
    });
  }

  // ===========================================
  // UNIFIED USER OPERATIONS
  // ===========================================

  // Buscar usuário por email (qualquer tipo)
  static async getUserByEmail(email: string) {
    // Tentar buscar em todas as tabelas
    const [seller, customer] = await Promise.all([
      prisma.seller.findUnique({ where: { email } }),
      prisma.customer.findFirst({ where: { email } }),
    ]);

    if (seller) return { ...seller, user_type: 'seller' };
    if (customer) return { ...customer, user_type: 'customer' };
    
    return null;
  }

  // ===========================================
  // TOKEN OPERATIONS
  // ===========================================

  // Renovar token
  static async updateSellerName(userId: string, newName: string) {
    return await prisma.seller.update({
      where: { id: userId },
      data: { name: newName },
    });
  }

  static async refreshToken(refreshToken: string) {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error('Token inválido ou expirado');
    }

    return {
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at,
    };
  }

  // Logout
  static async logout(accessToken: string) {
    const supabase = createServerSupabaseClient();

    await supabase.auth.admin.signOut(accessToken);
  }

  // ===========================================
  // STORE OPERATIONS
  // ===========================================

  // Criar loja padrão para seller
  static async createDefaultStore(sellerId: string) {
    return await prisma.store.create({
      data: {
        name: 'Minha Loja',
        contactEmail: '', // Será preenchido pelo seller depois
        subdomain: `loja-${Date.now()}`, // Subdomínio único temporário
        sellerId,
      },
    });
  }

  // Verificar token válido
  static async verifyToken(accessToken: string) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      throw new Error('Token inválido');
    }

    return data.user;
  }

  // ===========================================
  // PASSWORD RESET
  // ===========================================

  // Solicitar reset de senha
  static async requestPasswordReset(email: string) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      throw new Error('Erro ao enviar email de recuperação');
    }

    return { success: true };
  }

  // Atualizar senha
  static async updatePassword(accessToken: string, newPassword: string) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error('Erro ao atualizar senha');
    }

    return { success: true };
  }

  // ===========================================
  // EMAIL VERIFICATION
  // ===========================================

  // Reenviar email de verificação
  static async resendVerificationEmail(email: string) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      throw new Error('Erro ao reenviar email de verificação');
    }

    return { success: true };
  }

  // ===========================================
  // USER VALIDATION
  // ===========================================

  // Validar se usuário é seller
  static async validateSeller(accessToken: string) {
    const user = await this.verifyToken(accessToken);
    
    if (user?.user_metadata?.user_type !== 'seller') {
      throw new Error('Acesso negado. Usuário não é um vendedor.');
    }

    return user;
  }

  // Validar se usuário é customer
  static async validateCustomer(accessToken: string) {
    const user = await this.verifyToken(accessToken);
    
    if (user?.user_metadata?.user_type !== 'customer') {
      throw new Error('Acesso negado. Usuário não é um cliente.');
    }

    return user;
  }
}
