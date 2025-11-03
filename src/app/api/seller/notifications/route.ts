import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { NotificationService } from '@/lib/services/notificationService';

// GET: retorna configurações do seller autenticado
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || '';
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await AuthService.validateSeller(accessToken);
    const settings = await NotificationService.getSettingsBySellerId(user.id);
    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    console.error('[NOTIFICATIONS GET] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    // Se for erro de tabela não encontrada, sugerir migração
    if (errorMessage.includes('does not exist') || errorMessage.includes('seller_notification_settings')) {
      return NextResponse.json({ 
        error: 'Tabela não encontrada. Execute a migração: npx prisma migrate deploy' 
      }, { status: 500 });
    }
    return NextResponse.json({ error: 'Erro ao carregar configurações' }, { status: 500 });
  }
}

// PUT: atualiza configurações do seller autenticado
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || '';
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const seller = await AuthService.validateSeller(accessToken);

    const body = await request.json();
    const data = {
      approvedEnabled: !!body?.approvedEnabled,
      approvedUrl: (body?.approvedUrl ?? null) as string | null,
      pendingEnabled: !!body?.pendingEnabled,
      pendingUrl: (body?.pendingUrl ?? null) as string | null,
      chargebackEnabled: !!body?.chargebackEnabled,
      chargebackUrl: (body?.chargebackUrl ?? null) as string | null,
    };

    // Validação simples das URLs (opcional)
    const urlRegex = /^https?:\/\//i;
    const urlKeys: Array<'approvedUrl' | 'pendingUrl' | 'chargebackUrl'> = ['approvedUrl', 'pendingUrl', 'chargebackUrl'];
    urlKeys.forEach((key) => {
      const v = data[key];
      if (v && typeof v === 'string' && !urlRegex.test(v)) {
        // tornar null se inválida
        data[key] = null;
      }
    });

    const saved = await NotificationService.upsertSettingsBySellerId(seller.id, data);
    return NextResponse.json({ message: 'Configurações salvas', settings: saved });
  } catch (error) {
    console.error('[NOTIFICATIONS PUT] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    // Se for erro de tabela não encontrada, sugerir migração
    if (errorMessage.includes('does not exist') || errorMessage.includes('seller_notification_settings')) {
      return NextResponse.json({ 
        error: 'Tabela não encontrada. Execute a migração: npx prisma migrate deploy' 
      }, { status: 500 });
    }
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}


