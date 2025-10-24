import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Retorna o perfil do seller autenticado
 * GET /api/seller/profile/me?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('🔍 [Profile] Iniciando busca do perfil do seller...');
    console.log('👤 [Profile] UserId recebido:', userId);
    
    if (!userId) {
      console.log('❌ [Profile] UserId não fornecido');
      return NextResponse.json(
        { error: 'UserId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar seller no banco pelo ID
    console.log('📧 [Profile] Buscando seller com ID:', userId);
    
    const seller = await prisma.seller.findUnique({
      where: {
        id: userId,
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
