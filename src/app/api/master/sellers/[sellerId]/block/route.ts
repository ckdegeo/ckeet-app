import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createUserSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de acesso é obrigatório' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const supabase = createUserSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('[Block Seller] Erro de autenticação:', authError?.message || 'User não encontrado');
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Log para debug
    console.log('[Block Seller] User type:', user.user_metadata?.user_type);
    console.log('[Block Seller] User metadata:', JSON.stringify(user.user_metadata, null, 2));
    console.log('[Block Seller] User email:', user.email);
    
    // Verificar se é master - verificar também se existe no banco
    const userType = user.user_metadata?.user_type;
    if (userType !== 'master') {
      // Tentar verificar se existe master no banco com esse email
      const masterInDb = await prisma.master.findUnique({
        where: { email: user.email || '' }
      });
      
      if (!masterInDb) {
        console.error('[Block Seller] Acesso negado - não é master e não existe no banco');
        return NextResponse.json(
          { error: 'Acesso negado. Apenas administradores podem bloquear lojas.' },
          { status: 403 }
        );
      }
      
      // Se existe no banco mas não tem user_type = master, permitir acesso mesmo assim
      // (o user_type pode não estar atualizado ainda)
      console.log('[Block Seller] Master encontrado no banco, permitindo acesso mesmo sem user_type correto nos metadados');
    }

    const { sellerId } = await params;
    const { action } = await request.json(); // 'block' ou 'unblock'

    if (!sellerId) {
      return NextResponse.json(
        { error: 'ID do seller é obrigatório' },
        { status: 400 }
      );
    }

    if (action !== 'block' && action !== 'unblock') {
      return NextResponse.json(
        { error: 'Ação inválida. Use "block" ou "unblock"' },
        { status: 400 }
      );
    }

    // Buscar seller e sua loja
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        store: {
          select: {
            id: true,
            isActive: true
          }
        }
      }
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller não encontrado' },
        { status: 404 }
      );
    }

    // Se não tem loja, não pode bloquear/desbloquear
    if (!seller.store) {
      return NextResponse.json(
        { error: 'Seller não possui loja cadastrada' },
        { status: 400 }
      );
    }

    const isBlocking = action === 'block';
    const newStatus = !isBlocking; // true = desbloquear, false = bloquear

    // Verificar se já está no estado desejado
    if (seller.store.isActive === newStatus) {
      const statusText = newStatus ? 'desbloqueada' : 'bloqueada';
      return NextResponse.json(
        { error: `Loja já está ${statusText}` },
        { status: 400 }
      );
    }

    // Atualizar status da loja
    await prisma.store.update({
      where: { id: seller.store.id },
      data: { isActive: newStatus }
    });

    return NextResponse.json({
      success: true,
      message: isBlocking ? 'Loja bloqueada com sucesso' : 'Loja desbloqueada com sucesso',
      data: {
        sellerId: seller.id,
        storeId: seller.store.id,
        isActive: newStatus
      }
    });

  } catch (error) {
    console.error('Erro ao bloquear/desbloquear loja:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

