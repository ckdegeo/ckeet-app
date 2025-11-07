import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';
import { validateEmail } from '@/lib/utils/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 registros por IP a cada 15 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`customer-register:${identifier}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000, // 15 minutos
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Muitas tentativas de registro. Tente novamente em alguns minutos.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }
    const { 
      email, 
      password, 
      name, 
      phone,
      subdomain // Novo: subdomain da loja
    } = await request.json();

    // Validar dados de entrada
    if (!email || !password || !name || !subdomain) {
      return NextResponse.json(
        { error: 'Email, senha, nome e subdomain são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Validar domínio do email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validar força da senha
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar seller pelo subdomain
    const seller = await AuthService.getSellerBySubdomain(subdomain);
    if (!seller) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se email já existe nesta loja específica
    const existingCustomer = await AuthService.getCustomerByEmailAndSeller(email, seller.id);
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email já cadastrado nesta loja' },
        { status: 409 }
      );
    }

    // Registrar no Supabase Auth
    // Para customers, não exigimos confirmação de email (configurado no Supabase dashboard)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Não redirecionar para confirmação
        data: {
          user_type: 'customer',
          name,
          sellerId: seller.id, // Incluir sellerId nos metadados
          ...(phone && { phone }),
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Criar customer no Prisma
    const customer = await AuthService.createCustomer({
      id: authData.user!.id,
      email,
      name,
      phone: phone || '',
      sellerId: seller.id, // Incluir sellerId
      password: '', // Senha gerenciada pelo Supabase
    });

    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso!',
      user: {
        id: authData.user!.id,
        email: authData.user!.email,
        name: authData.user!.user_metadata?.name,
        user_type: 'customer',
        customer_id: customer.id,
      },
      tokens: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
        expires_at: authData.session?.expires_at || 0,
      },
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
