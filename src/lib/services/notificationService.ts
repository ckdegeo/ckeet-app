import { prisma } from '@/lib/prisma';

export type NotificationType = 'approved' | 'pending' | 'chargeback';

export interface PushcutPayload {
  title?: string;
  text?: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  static async getSettingsBySellerId(sellerId: string) {
    return (prisma as any).sellerNotificationSettings.findUnique({ where: { sellerId } });
  }

  static async upsertSettingsBySellerId(sellerId: string, settings: {
    approvedEnabled?: boolean;
    approvedUrl?: string | null;
    pendingEnabled?: boolean;
    pendingUrl?: string | null;
    chargebackEnabled?: boolean;
    chargebackUrl?: string | null;
  }) {
    const existing = await (prisma as any).sellerNotificationSettings.findUnique({ where: { sellerId } });
    if (existing) {
      return (prisma as any).sellerNotificationSettings.update({ where: { sellerId }, data: settings });
    }
    return (prisma as any).sellerNotificationSettings.create({ data: { sellerId, ...settings } });
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


