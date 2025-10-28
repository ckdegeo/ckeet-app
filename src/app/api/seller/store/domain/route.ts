import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { isValidSubdomain, isReservedSubdomain } from '@/lib/config/domains';

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DA CRIAÇÃO DE DOMÍNIO ===');
    
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token recebido:', accessToken ? 'Sim' : 'Não');
    
    if (!accessToken) {
      console.log('Erro: Token não fornecido');
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    console.log('Usuário autenticado:', user ? user.id : 'Não');

    if (authError || !user) {
      console.log('Erro de autenticação:', authError?.message);
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subdomain } = body;
    console.log('Subdomínio recebido:', subdomain);

    // Validar subdomínio
    if (!subdomain) {
      console.log('Erro: Subdomínio não fornecido');
      return NextResponse.json(
        { error: 'Subdomínio é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato do subdomínio
    const isValid = isValidSubdomain(subdomain);
    console.log('Subdomínio válido:', isValid);
    
    if (!isValid) {
      console.log('Erro: Formato de subdomínio inválido');
      return NextResponse.json(
        { error: 'Formato de subdomínio inválido. Use apenas letras minúsculas, números e hífen.' },
        { status: 400 }
      );
    }

    // Verificar se subdomínio está reservado
    const isReserved = isReservedSubdomain(subdomain);
    console.log('Subdomínio reservado:', isReserved);
    
    if (isReserved) {
      console.log('Erro: Subdomínio reservado');
      return NextResponse.json(
        { error: 'Este subdomínio está reservado. Escolha outro nome.' },
        { status: 400 }
      );
    }

    // Buscar seller
    console.log('Buscando seller no banco de dados...');
    const seller = await prisma.seller.findUnique({
      where: { id: user.id },
      include: { store: true }
    });

    if (!seller) {
      console.log('Erro: Seller não encontrado');
      return NextResponse.json(
        { error: 'Seller não encontrado' },
        { status: 404 }
      );
    }
    console.log('Seller encontrado:', seller.id);

    // Verificar se subdomínio já existe
    console.log('Verificando se subdomínio já existe...');
    const existingStore = await prisma.store.findFirst({
      where: { 
        subdomain,
        id: { not: seller.store?.id }
      }
    });

    if (existingStore) {
      console.log('Erro: Subdomínio já existe');
      return NextResponse.json(
        { error: 'Este subdomínio já está em uso. Escolha outro nome.' },
        { status: 400 }
      );
    }
    console.log('Subdomínio disponível');

    // Criar domínio na Vercel
    const domainName = `${subdomain}.ckeet.store`;
    
    try {
      const vercelToken = process.env.VERCEL_TOKEN;
      const vercelProjectId = process.env.VERCEL_PROJECT_ID;
      
      if (vercelToken && vercelProjectId) {
        const vercelResponse = await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/domains`, {
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

        const vercelData = await vercelResponse.json();

        if (!vercelResponse.ok) {
          // Se o domínio já existe na Vercel, continuar
          if (vercelResponse.status !== 409 && vercelData.error?.code !== 'domain_already_exists') {
            console.error('Erro ao criar domínio na Vercel:', vercelData.error?.message);
          }
        }
      }
    } catch (vercelError) {
      // Não falhar a operação, apenas logar o erro
      console.error('Erro ao criar domínio na Vercel:', vercelError);
    }

    // Atualizar ou criar loja com o novo subdomínio
    let store;
    if (seller.store) {
      console.log('Atualizando loja existente...');
      store = await prisma.store.update({
        where: { id: seller.store.id },
        data: { subdomain }
      });
    } else {
      console.log('Criando nova loja...');
      store = await prisma.store.create({
        data: {
          name: 'Minha Loja',
          contactEmail: seller.email || '',
          logoUrl: '',
          primaryColor: '#bd253c',
          secondaryColor: '#970b27',
          subdomain,
          sellerId: user.id,
        }
      });
    }
    console.log('Loja criada/atualizada:', store.id);

    console.log('=== DOMÍNIO CRIADO COM SUCESSO ===');
    return NextResponse.json({
      message: 'Domínio criado com sucesso!',
      domain: domainName,
      store: {
        id: store.id,
        subdomain: store.subdomain,
      }
    });

  } catch (error) {
    console.error('=== ERRO AO CRIAR DOMÍNIO ===');
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de acesso não fornecido' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar seller
    const seller = await prisma.seller.findUnique({
      where: { id: user.id },
      include: { store: true }
    });

    if (!seller || !seller.store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      domain: `${seller.store.subdomain}.ckeet.store`,
      subdomain: seller.store.subdomain,
    });

  } catch (error) {
    console.error('Erro ao buscar domínio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}