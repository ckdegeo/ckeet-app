import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

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

    // Buscar loja do seller
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
      store: {
        id: seller.store.id,
        name: seller.store.name,
        contactEmail: seller.store.contactEmail,
        logoUrl: seller.store.logoUrl,
        primaryColor: seller.store.primaryColor,
        secondaryColor: seller.store.secondaryColor,
        subdomain: seller.store.subdomain,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar configurações da loja:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { name, contactEmail, logoUrl, primaryColor, secondaryColor } = body;

    // Validar dados obrigatórios
    if (!name || !contactEmail) {
      return NextResponse.json(
        { error: 'Nome e email de contato são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar seller
    const seller = await prisma.seller.findUnique({
      where: { id: user.id },
      include: { store: true }
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar ou criar loja
    let store;
    if (seller.store) {
      store = await prisma.store.update({
        where: { id: seller.store.id },
        data: {
          name,
          contactEmail,
          logoUrl,
          primaryColor,
          secondaryColor,
        }
      });
    } else {
      store = await prisma.store.create({
        data: {
          name,
          contactEmail,
          logoUrl,
          primaryColor,
          secondaryColor,
          subdomain: `loja-${Date.now()}`, // Subdomínio temporário
          sellerId: user.id,
        }
      });
    }

    return NextResponse.json({
      message: 'Configurações salvas com sucesso!',
      store: {
        id: store.id,
        name: store.name,
        contactEmail: store.contactEmail,
        logoUrl: store.logoUrl,
        primaryColor: store.primaryColor,
        secondaryColor: store.secondaryColor,
        subdomain: store.subdomain,
      }
    });

  } catch (error) {
    console.error('Erro ao salvar configurações da loja:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
