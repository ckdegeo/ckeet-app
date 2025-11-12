import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/utils/rateLimit';
import { validateEmail, validateCPF } from '@/lib/utils/validation';
import { prisma } from '@/lib/prisma';
import { isValidSubdomain, isReservedSubdomain } from '@/lib/config/domains';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RegisterCompleteData {
  // Dados do seller
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  // Dados da loja
  subdomain: string;
  storeName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  homeBannerUrl: string;
  storeBannerUrl: string;
  // OTP de verificação
  otpCode: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 registros por IP a cada 15 minutos
    const identifier = getRateLimitIdentifier(request);
    const rateLimit = checkRateLimit(`register-complete:${identifier}`, {
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
    
    const body: RegisterCompleteData = await request.json();
    
    // Logs de debug
    console.log('🔍 [SERVER] Dados recebidos:', {
      seller: {
        name: body.name ? 'PRESENT' : 'MISSING',
        email: body.email ? 'PRESENT' : 'MISSING',
        cpf: body.cpf ? 'PRESENT' : 'MISSING',
        phone: body.phone ? 'PRESENT' : 'MISSING',
        password: body.password ? 'PRESENT' : 'MISSING',
      },
      store: {
        subdomain: body.subdomain || 'MISSING',
        storeName: body.storeName || 'MISSING',
        primaryColor: body.primaryColor || 'MISSING',
        secondaryColor: body.secondaryColor || 'MISSING',
        logoUrl: body.logoUrl || 'EMPTY',
        homeBannerUrl: body.homeBannerUrl || 'EMPTY',
        storeBannerUrl: body.storeBannerUrl || 'EMPTY',
      },
    });

    const { 
      name,
      email,
      cpf,
      phone,
      password,
      subdomain,
      storeName,
      primaryColor,
      secondaryColor,
      logoUrl,
      homeBannerUrl,
      storeBannerUrl,
      otpCode,
    } = body;

    // Validar OTP primeiro usando Supabase Auth nativo
    if (!otpCode) {
      return NextResponse.json(
        { error: 'Código de verificação é obrigatório' },
        { status: 400 }
      );
    }

    // Normalizar código
    const normalizedCode = otpCode.trim().replace(/\s/g, '');

    // Verificar OTP usando Supabase Auth
    // IMPORTANTE: Usar cliente com anon key para obter sessão do usuário
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: otpData, error: otpError } = await supabaseAnon.auth.verifyOtp({
      email,
      token: normalizedCode,
      type: 'email',
    });

    if (otpError || !otpData) {
      return NextResponse.json(
        { error: otpError?.message || 'Código de verificação inválido ou expirado' },
        { status: 400 }
      );
    }

    // O verifyOtp retorna uma sessão válida se o OTP estiver correto
    // Vamos usar essa sessão para obter o userId
    const verifiedUserId = otpData.user?.id;
    const verifiedSession = otpData.session;
    
    if (!verifiedUserId) {
      return NextResponse.json(
        { error: 'Erro ao verificar código: usuário não encontrado' },
        { status: 400 }
      );
    }

    // Validar dados de entrada
    if (!email || !password || !name || !cpf || !phone) {
      console.error('❌ [SERVER] Validação falhou - Campos do seller:', {
        email: !!email,
        password: !!password,
        name: !!name,
        cpf: !!cpf,
        phone: !!phone,
      });
      return NextResponse.json(
        { error: 'Todos os campos do seller são obrigatórios' },
        { status: 400 }
      );
    }

    if (!subdomain || !storeName || !primaryColor || !secondaryColor) {
      console.error('❌ [SERVER] Validação falhou - Campos da loja:', {
        subdomain: !!subdomain,
        storeName: !!storeName,
        primaryColor: !!primaryColor,
        secondaryColor: !!secondaryColor,
      });
      return NextResponse.json(
        { error: 'Subdomínio, nome da loja e cores são obrigatórios' },
        { status: 400 }
      );
    }

    // URLs de imagem podem estar vazias se os arquivos serão enviados depois
    // Mas vamos logar para debug
    if (!logoUrl || !homeBannerUrl || !storeBannerUrl) {
      console.warn('⚠️ [SERVER] URLs de imagem vazias (serão preenchidas após upload):', {
        logoUrl: logoUrl || 'EMPTY',
        homeBannerUrl: homeBannerUrl || 'EMPTY',
        storeBannerUrl: storeBannerUrl || 'EMPTY',
      });
      // Não retornar erro aqui, pois as imagens serão enviadas depois
    }

    // Validar domínio do email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validar CPF
    const cpfValidation = validateCPF(cpf);
    if (!cpfValidation.isValid) {
      return NextResponse.json(
        { error: cpfValidation.error },
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

    // Validar subdomínio
    if (!isValidSubdomain(subdomain)) {
      return NextResponse.json(
        { error: 'Formato de subdomínio inválido. Use apenas letras minúsculas, números e hífen.' },
        { status: 400 }
      );
    }

    if (isReservedSubdomain(subdomain)) {
      return NextResponse.json(
        { error: 'Este subdomínio está reservado e não pode ser usado.' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingSeller = await AuthService.getSellerByEmail(email);
    if (existingSeller) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se CPF já existe
    const existingCpf = await AuthService.getSellerByCpf(cpf);
    if (existingCpf) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se subdomínio já existe
    const existingStore = await prisma.store.findUnique({
      where: { subdomain },
    });

    if (existingStore) {
      return NextResponse.json(
        { error: 'Este subdomínio já está em uso' },
        { status: 409 }
      );
    }

    // O usuário já foi criado no send-otp e verificado com OTP
    // Agora precisamos atualizar a senha e metadata usando Admin API
    const supabaseAdmin = createServerSupabaseClient();
    const userId = verifiedUserId;

    // Atualizar senha e metadata do usuário verificado
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: {
        user_type: 'seller',
        name,
        cpf,
        phone,
      },
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Erro ao atualizar usuário' },
        { status: 400 }
      );
    }

    // Fazer login para obter nova sessão com a senha atualizada
    // Usar anon key para obter sessão do usuário
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      console.error('❌ [SERVER] Erro ao fazer login após atualização:', signInError);
      // Mesmo sem sessão, podemos continuar (mas sem tokens)
    }

    // Preparar dados de resposta
    const authData = {
      user: otpData.user,
      session: signInData?.session || verifiedSession, // Usar sessão do login ou do OTP
    };

    // Criar seller no Prisma
    const seller = await AuthService.createSeller({
      id: userId,
      email,
      name,
      cpf,
      phone,
      password: '', // Senha gerenciada pelo Supabase
    });

    // Criar domínio na Vercel (opcional, não falhar se der erro)
    const domainName = `${subdomain}.ckeet.store`;
    try {
      const vercelToken = process.env.VERCEL_TOKEN;
      const vercelProjectId = process.env.VERCEL_PROJECT_ID;
      
      if (vercelToken && vercelProjectId) {
        await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/domains`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: domainName,
            redirect: null,
            redirectStatusCode: null,
          }),
        });
      }
    } catch (vercelError) {
      // Não falhar a operação, apenas logar o erro
      console.error('Erro ao criar domínio na Vercel:', vercelError);
    }

    // Criar loja no Prisma
    // Log antes de criar a loja
    console.log('🔍 [SERVER] Criando loja com dados:', {
      sellerId: seller.id,
      subdomain,
      name: storeName,
      primaryColor,
      secondaryColor,
      logoUrl: logoUrl || 'EMPTY (será preenchido após upload)',
      homeBannerUrl: homeBannerUrl || 'EMPTY (será preenchido após upload)',
      storeBannerUrl: storeBannerUrl || 'EMPTY (será preenchido após upload)',
    });

    const store = await prisma.store.create({
      data: {
        name: storeName,
        contactEmail: email,
        logoUrl,
        homeBannerUrl,
        storeBannerUrl,
        primaryColor: primaryColor || '#bd253c',
        secondaryColor: secondaryColor || '#970b27',
        subdomain,
        sellerId: userId,
      },
    });

    // Se temos sessão (email confirmado), retornar tokens
    console.log('🔍 [SERVER] Verificando sessão:', {
      hasSession: !!authData.session,
      hasAccessToken: !!authData.session?.access_token,
    });

    if (authData.session) {
      console.log('✅ [SERVER] Retornando tokens ao cliente');
      return NextResponse.json({
        success: true,
        message: 'Conta e loja criadas com sucesso!',
        user: {
          id: userId,
          email: email,
          name: name,
          user_type: 'seller',
          seller_id: seller.id,
          store_id: store.id,
        },
        tokens: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
        },
      });
    }

    // Se não tem sessão (precisa confirmar email), retornar sem tokens
    console.warn('⚠️ [SERVER] Sessão não disponível - confirmação de email pode ser necessária');
    return NextResponse.json({
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para confirmar a conta.',
      requiresEmailConfirmation: true,
      user: {
        id: userId,
        email: email,
        name: name,
        user_type: 'seller',
        seller_id: seller.id,
        store_id: store.id,
      },
    });

  } catch (error) {
    console.error('Erro no registro completo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

