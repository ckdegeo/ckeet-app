import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

/**
 * Retorna o perfil do seller autenticado
 * GET /api/seller/profile/me
 */
export async function GET() {
  try {
    console.log('🔍 [Profile] Iniciando busca do perfil do seller...');
    
    const supabase = await createServerSupabaseClient();
    console.log('✅ [Profile] Cliente Supabase criado');
    
    // Buscar sessão do Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔐 [Profile] Sessão Supabase:', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      email: session?.user?.email,
      error: sessionError?.message 
    });
    
    if (sessionError || !session) {
      console.log('❌ [Profile] Sessão não encontrada ou erro:', sessionError?.message);
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 401 }
      );
    }

    // Buscar seller no banco pelo email
    console.log('📧 [Profile] Buscando seller com email:', session.user.email);
    
    const seller = await prisma.seller.findUnique({
      where: {
        email: session.user.email!,
      },
      select: {
        id: true,
        email: true,
        name: true,
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });

    console.log('👤 [Profile] Seller encontrado:', { 
      found: !!seller, 
      id: seller?.id, 
      email: seller?.email 
    });

    if (!seller) {
      console.log('❌ [Profile] Seller não encontrado no banco');
      return NextResponse.json(
        { error: 'Seller não encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ [Profile] Retornando dados do seller');
    return NextResponse.json({
      id: seller.id,
      email: seller.email,
      name: seller.name,
      store: seller.store,
    });

  } catch (error) {
    console.error('Erro ao buscar perfil do seller:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
