import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/services/authService';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 tentativas de login por IP a cada 5 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`login:${identifier}`, {
      maxRequests: 5,
      windowMs: 5 * 60 * 1000, // 5 minutos
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }
    const { email, password } = await request.json();

    // Validar dados de entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Usar ANON_KEY para autenticação de usuário (não SERVICE_ROLE_KEY)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fazer login no Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('[Login] Erro de autenticação:', authError.message);
      
      // Verificar se é erro de email não confirmado
      if (authError.message === 'Email not confirmed') {
        return NextResponse.json(
          { error: 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar se é um seller ou se pode se tornar um
    const userType = authData.user?.user_metadata?.user_type;
    
    // Se não é seller, verificar se pode se tornar um (criar conta de seller)
    if (userType !== 'seller') {
      // Verificar se já existe um seller com este email
      const existingSeller = await AuthService.getSellerByEmail(email);
      
      if (!existingSeller) {
        return NextResponse.json(
          { error: 'Acesso negado. Esta área é apenas para vendedores. Cadastre-se como vendedor primeiro.' },
          { status: 403 }
        );
      }
      
      // Se existe seller, atualizar user_type nos metadados
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...authData.user.user_metadata,
          user_type: 'seller'
        }
      });
      
      if (updateError) {
        console.error('Erro ao atualizar user_type:', updateError);
        // Continuar mesmo com erro, pois o seller existe
      }
    }

    // Sincronizar usuário com Prisma
    await AuthService.syncUser(authData.user);

    // Obter dados do seller
    const seller = await AuthService.getSellerByEmail(email);

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name,
        user_type: 'seller',
        seller_id: seller?.id,
        store_id: seller?.store?.id,
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
