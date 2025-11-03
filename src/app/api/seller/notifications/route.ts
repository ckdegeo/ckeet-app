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
    ['approvedUrl', 'pendingUrl', 'chargebackUrl'].forEach((k) => {
      const key = k as keyof typeof data;
      const v = data[key] as unknown as string | null;
      if (v && !urlRegex.test(v)) {
        // tornar null se inválida
        (data as any)[key] = null;
      }
    });

    const saved = await NotificationService.upsertSettingsBySellerId(seller.id, data);
    return NextResponse.json({ message: 'Configurações salvas', settings: saved });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 });
  }
}


