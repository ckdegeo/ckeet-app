import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { isValidSubdomain, isReservedSubdomain } from '@/lib/config/domains';

// GET - Verificar se o seller tem domínio configurado
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Buscar store do seller
    const seller = await prisma.seller.findUnique({
      where: { id: user.id },
      include: { store: true },
    });

    if (!seller || !seller.store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 });
    }

    // Verificar se tem domínio configurado (subdomain não é temporário)
    const hasDomain = seller.store.subdomain && !seller.store.subdomain.startsWith('loja-');

    return NextResponse.json({
      hasDomain,
      subdomain: seller.store.subdomain,
      customDomain: seller.store.customDomain,
      storeId: seller.store.id,
    });

  } catch (error) {
    console.error('Erro ao verificar domínio:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Configurar domínio do seller
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { subdomain, customDomain } = await request.json();

    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomínio é obrigatório' }, { status: 400 });
    }

    // Validar formato do subdomínio
    if (!isValidSubdomain(subdomain)) {
      return NextResponse.json({ 
        error: 'Subdomínio inválido. Use apenas letras minúsculas, números e hífen. Mínimo 3 caracteres.' 
      }, { status: 400 });
    }

    // Verificar se é subdomínio reservado
    if (isReservedSubdomain(subdomain)) {
      return NextResponse.json({ 
        error: 'Este subdomínio está reservado. Escolha outro.' 
      }, { status: 400 });
    }

    // Buscar store do seller
    const seller = await prisma.seller.findUnique({
      where: { id: user.id },
      include: { store: true },
    });

    if (!seller || !seller.store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 });
    }

    // Verificar se o subdomínio já está em uso
    const existingStore = await prisma.store.findFirst({
      where: {
        subdomain,
        id: { not: seller.store.id },
      },
    });

    if (existingStore) {
      return NextResponse.json({ 
        error: 'Este subdomínio já está em uso. Escolha outro.' 
      }, { status: 409 });
    }

    // Integrar com API da Vercel para criar o domínio dinâmico
    const { VercelService } = await import('@/lib/services/vercelService');
    const vercelResult = await VercelService.createDomain(subdomain.toLowerCase());

    if (!vercelResult.success) {
      console.error('Erro ao criar domínio na Vercel:', vercelResult.error);
      // Continuar mesmo se houver erro na Vercel, mas avisar o usuário
    }

    // Atualizar store com o novo domínio
    const updatedStore = await prisma.store.update({
      where: { id: seller.store.id },
      data: {
        subdomain: subdomain.toLowerCase(),
        customDomain: customDomain || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: vercelResult.success 
        ? 'Domínio configurado com sucesso! Sua loja já está disponível.' 
        : 'Domínio salvo, mas houve um problema na configuração. Entre em contato com o suporte.',
      store: updatedStore,
      vercelDomain: vercelResult.domain,
    });

  } catch (error) {
    console.error('Erro ao configurar domínio:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

