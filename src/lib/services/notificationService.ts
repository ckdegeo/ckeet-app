import { prisma } from '@/lib/prisma';

export type NotificationType = 'approved' | 'pending' | 'chargeback';

export class NotificationService {
  // Tipagens locais para evitar uso de 'any' sem depender do client gerado
  private static get sns() {
    type SellerNotificationSettings = {
      sellerId: string;
      approvedEnabled: boolean;
      approvedUrl: string | null;
      pendingEnabled: boolean;
      pendingUrl: string | null;
      chargebackEnabled: boolean;
      chargebackUrl: string | null;
    };

    type FindUniqueArgs = { where: { sellerId: string } };
    type UpdateArgs = { where: { sellerId: string }; data: Partial<SellerNotificationSettings> };
    type CreateArgs = { data: SellerNotificationSettings };

    type Delegate = {
      findUnique(args: FindUniqueArgs): Promise<SellerNotificationSettings | null>;
      update(args: UpdateArgs): Promise<SellerNotificationSettings>;
      create(args: CreateArgs): Promise<SellerNotificationSettings>;
    };

    return (prisma as unknown as { sellerNotificationSettings: Delegate }).sellerNotificationSettings;
  }
  static async getSettingsBySellerId(sellerId: string) {
    return this.sns.findUnique({ where: { sellerId } });
  }

  static async upsertSettingsBySellerId(sellerId: string, settings: {
    approvedEnabled?: boolean;
    approvedUrl?: string | null;
    pendingEnabled?: boolean;
    pendingUrl?: string | null;
    chargebackEnabled?: boolean;
    chargebackUrl?: string | null;
  }) {
    const existing = await this.sns.findUnique({ where: { sellerId } });
    if (existing) {
      return this.sns.update({ where: { sellerId }, data: settings });
    }
    return this.sns.create({
      data: {
        sellerId,
        approvedEnabled: settings.approvedEnabled ?? false,
        approvedUrl: settings.approvedUrl ?? null,
        pendingEnabled: settings.pendingEnabled ?? false,
        pendingUrl: settings.pendingUrl ?? null,
        chargebackEnabled: settings.chargebackEnabled ?? false,
        chargebackUrl: settings.chargebackUrl ?? null,
      },
    });
  }

  static async sendPushcut(sellerId: string, type: NotificationType) {
    console.log(`[NotificationService] sendPushcut chamado - sellerId: ${sellerId}, type: ${type}`);
    
    const settings = await this.getSettingsBySellerId(sellerId);
    if (!settings) {
      console.log(`[NotificationService] Configurações não encontradas para sellerId: ${sellerId}`);
      return;
    }

    let enabled = false;
    let url: string | null | undefined = null;

    if (type === 'approved') {
      enabled = settings.approvedEnabled;
      url = settings.approvedUrl || undefined;
      console.log(`[NotificationService] approved - enabled: ${enabled}, url: ${url ? 'configurada' : 'não configurada'}`);
    } else if (type === 'pending') {
      enabled = settings.pendingEnabled;
      url = settings.pendingUrl || undefined;
      console.log(`[NotificationService] pending - enabled: ${enabled}, url: ${url ? 'configurada' : 'não configurada'}`);
    } else if (type === 'chargeback') {
      enabled = settings.chargebackEnabled;
      url = settings.chargebackUrl || undefined;
      console.log(`[NotificationService] chargeback - enabled: ${enabled}, url: ${url ? 'configurada' : 'não configurada'}`);
    }

    if (!enabled) {
      console.log(`[NotificationService] Notificação ${type} desabilitada para sellerId: ${sellerId}`);
      return;
    }

    if (!url) {
      console.log(`[NotificationService] URL não configurada para ${type} no sellerId: ${sellerId}`);
      return;
    }

    // Fire-and-forget; apenas disparar a URL sem enviar dados (Pushcut cobra para receber dados)
    try {
      console.log(`[NotificationService] Disparando Pushcut URL: ${url}`);
      const response = await fetch(url, {
        method: 'GET', // GET sem dados - apenas disparar a URL
        // Sem headers, sem body - apenas executar o link
      });
      
      if (!response.ok) {
        console.error(`[NotificationService] Pushcut retornou erro HTTP ${response.status} ${response.statusText}`);
        const text = await response.text().catch(() => 'Erro ao ler resposta');
        console.error(`[NotificationService] Resposta:`, text);
      } else {
        console.log(`[NotificationService] Pushcut URL disparada com sucesso (HTTP ${response.status})`);
      }
    } catch (err) {
      // Apenas log; não quebrar o fluxo de negócio
      console.error('[NotificationService] Erro ao disparar Pushcut URL:', err);
      if (err instanceof Error) {
        console.error('[NotificationService] Erro message:', err.message);
        console.error('[NotificationService] Erro stack:', err.stack);
      }
    }
  }
}


