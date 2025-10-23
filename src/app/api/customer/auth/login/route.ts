import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password,
      subdomain // Novo: subdomain da loja
    } = await request.json();

    // Validar dados de entrada
    if (!email || !password || !subdomain) {
      return NextResponse.json(
        { error: 'Email, senha e subdomain são obrigatórios' },
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
    
    const supabase = createServerSupabaseClient();

    // Fazer login no Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar se é um customer
    const userType = authData.user?.user_metadata?.user_type;
    if (userType !== 'customer') {
      return NextResponse.json(
        { error: 'Acesso negado. Esta área é apenas para clientes.' },
        { status: 403 }
      );
    }

    // Verificar se o customer pertence a esta loja específica
    const customer = await AuthService.getCustomerByEmailAndSeller(email, seller.id);
    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado nesta loja' },
        { status: 404 }
      );
    }

    // Sincronizar usuário com Prisma
    await AuthService.syncUser(authData.user);

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name,
        user_type: 'customer',
        customer_id: customer.id,
        seller_id: seller.id,
      },
      tokens: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
