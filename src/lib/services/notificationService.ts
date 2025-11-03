import { prisma } from '@/lib/prisma';

export type NotificationType = 'approved' | 'pending' | 'chargeback';

export interface PushcutPayload {
  title?: string;
  text?: string;
  data?: Record<string, unknown>;
}

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

  static async sendPushcut(sellerId: string, type: NotificationType, payload: PushcutPayload = {}) {
    const settings = await this.getSettingsBySellerId(sellerId);
    if (!settings) return;

    let enabled = false;
    let url: string | null | undefined = null;

    if (type === 'approved') {
      enabled = settings.approvedEnabled;
      url = settings.approvedUrl || undefined;
    } else if (type === 'pending') {
      enabled = settings.pendingEnabled;
      url = settings.pendingUrl || undefined;
    } else if (type === 'chargeback') {
      enabled = settings.chargebackEnabled;
      url = settings.chargebackUrl || undefined;
    }

    if (!enabled || !url) return;

    // Fire-and-forget; não bloquear o fluxo principal
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Keep-alive curto
      });
    } catch (err) {
      // Apenas log; não quebrar o fluxo de negócio
      console.error('[NotificationService] Pushcut failed', err);
    }
  }
}


