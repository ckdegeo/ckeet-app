import { prisma } from '@/lib/prisma';

// ===========================================
// INTERFACES
// ===========================================

export interface MercadoPagoOAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token?: string;
}

export interface MercadoPagoPaymentResponse {
  id: string;
  status: string;
  status_detail: string;
  currency_id: string;
  description: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  net_amount: number;
  fee_details: Array<{
    type: string;
    amount: number;
  }>;
  collector: {
    id: number;
    email: string;
    nickname: string;
  };
  payer: {
    id: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  metadata?: {
    order_id?: string;
    seller_id?: string;
    store_id?: string;
    [key: string]: unknown;
  };
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
}

// ===========================================
// MERCADO PAGO SERVICE
// ===========================================

export class MercadoPagoService {
  private static readonly BASE_URL = 'https://api.mercadopago.com';
  private static readonly AUTH_URL = 'https://auth.mercadopago.com.br';

  /**
   * Gera URL de autorização OAuth para o seller
   */
  static getOAuthRedirectUrl(sellerId: string): string {
    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      throw new Error('Variáveis de ambiente do Mercado Pago não configuradas');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      platform_id: 'mp',
      state: sellerId,
      redirect_uri: redirectUri,
    });

    return `${this.AUTH_URL}/authorization?${params.toString()}`;
  }

  /**
   * Troca código de autorização por tokens
   */
  static async exchangeCodeForTokens(code: string, sellerId: string): Promise<MercadoPagoOAuthResponse> {
    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
    const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Variáveis de ambiente do Mercado Pago não configuradas');
    }

    // Tentar diferentes endpoints OAuth
    const tokenUrls = [
      `${this.AUTH_URL}/oauth/token`,
      'https://api.mercadopago.com/oauth/token',
    ];
    
    for (const tokenUrl of tokenUrls) {
      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
          }),
        });

        if (response.ok) {
          const data: MercadoPagoOAuthResponse = await response.json();
          await this.saveSellerCredentials(sellerId, data);
          return data;
        } else {
          const error = await response.text();
          
          // Se não é o último endpoint, continuar tentando
          if (tokenUrl !== tokenUrls[tokenUrls.length - 1]) {
            continue;
          }
          
          console.error('[MercadoPago] Erro ao trocar código por tokens:', error.substring(0, 200));
          throw new Error(`Erro ao trocar código por tokens (${response.status})`);
        }
      } catch (error) {
        // Se não é o último endpoint, continuar tentando
        if (tokenUrl !== tokenUrls[tokenUrls.length - 1]) {
          continue;
        }
        
        console.error('[MercadoPago] Erro na requisição OAuth:', error);
        throw error;
      }
    }
    
    throw new Error('Todos os endpoints OAuth falharam');
  }

  /**
   * Renova access token usando refresh token
   */
  static async refreshAccessToken(sellerId: string): Promise<MercadoPagoOAuthResponse> {
    const config = await this.getSellerCredentials(sellerId);
    
    if (!config?.refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    const clientId = process.env.MERCADOPAGO_CLIENT_ID;
    const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Variáveis de ambiente do Mercado Pago não configuradas');
    }

    const response = await fetch(`${this.AUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: config.refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao renovar token: ${error}`);
    }

    const data: MercadoPagoOAuthResponse = await response.json();
    
    // Atualizar credenciais no banco
    await this.updateSellerCredentials(sellerId, data);
    
    return data;
  }

  /**
   * Salva credenciais do seller no banco
   */
  static async saveSellerCredentials(sellerId: string, credentials: MercadoPagoOAuthResponse): Promise<void> {
    const expiresAt = new Date(Date.now() + credentials.expires_in * 1000);

    await prisma.sellerPaymentConfig.upsert({
      where: {
        unique_seller_provider: {
          sellerId,
          provider: 'MERCADO_PAGO',
        },
      },
      update: {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token,
        userId: credentials.user_id.toString(),
        expiresAt,
        tokenType: credentials.token_type,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
        errorMessage: null,
      },
      create: {
        sellerId,
        provider: 'MERCADO_PAGO',
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token,
        userId: credentials.user_id.toString(),
        expiresAt,
        tokenType: credentials.token_type,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
      },
    });
  }

  /**
   * Atualiza credenciais do seller no banco
   */
  static async updateSellerCredentials(sellerId: string, credentials: MercadoPagoOAuthResponse): Promise<void> {
    const expiresAt = new Date(Date.now() + credentials.expires_in * 1000);

    await prisma.sellerPaymentConfig.updateMany({
      where: {
        sellerId,
        provider: 'MERCADO_PAGO',
      },
      data: {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token,
        expiresAt,
        status: 'CONNECTED',
        lastSyncAt: new Date(),
        errorMessage: null,
      },
    });
  }

  /**
   * Busca credenciais do seller
   */
  static async getSellerCredentials(sellerId: string) {
    return await prisma.sellerPaymentConfig.findUnique({
      where: {
        unique_seller_provider: {
          sellerId,
          provider: 'MERCADO_PAGO',
        },
      },
    });
  }

  /**
   * Cria pagamento PIX com split (comissão da plataforma)
   */
  static async createPixPayment(params: {
    amount: number;
    description: string;
    externalReference: string;
    sellerAccessToken: string;
    sellerCollectorId: string;
    applicationFee: number;
    customerEmail: string;
    customerName?: string;
  }): Promise<{
    success: boolean;
    paymentId?: string;
    qrCode?: string;
    qrCodeText?: string;
    expiresAt?: string;
    error?: string;
  }> {
    try {
      const paymentData = {
        transaction_amount: params.amount,
        description: params.description,
        payment_method_id: 'pix',
        external_reference: params.externalReference,
        application_fee: params.applicationFee,
        payer: {
          email: params.customerEmail,
          ...(params.customerName && { first_name: params.customerName.split(' ')[0] }),
        },
        metadata: {
          order_id: params.externalReference,
          collector_id: params.sellerCollectorId,
        },
      };

      const response = await fetch(`${this.BASE_URL}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${params.sellerAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Erro ao criar pagamento PIX: ${error}`
        };
      }

      const payment: MercadoPagoPaymentResponse = await response.json();

      // Buscar QR Code do PIX
      const qrResponse = await fetch(`${this.BASE_URL}/v1/payments/${payment.id}`, {
        headers: {
          'Authorization': `Bearer ${params.sellerAccessToken}`,
        },
      });

      if (!qrResponse.ok) {
        return {
          success: false,
          error: 'Erro ao buscar QR Code do PIX'
        };
      }

      const qrData = await qrResponse.json();
      const pointOfInteraction = qrData.point_of_interaction?.transaction_data;

      return {
        success: true,
        paymentId: payment.id,
        qrCode: pointOfInteraction?.qr_code_base64,
        qrCodeText: pointOfInteraction?.qr_code,
        expiresAt: payment.date_created ? new Date(payment.date_created).toISOString() : undefined
      };

    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      return {
        success: false,
        error: 'Erro interno ao criar pagamento PIX'
      };
    }
  }

  /**
   * Busca status de um pagamento
   */
  static async getPaymentStatus(params: {
    paymentId: string;
    accessToken: string;
  }): Promise<{
    success: boolean;
    status?: string;
    statusDetail?: string;
    transactionAmount?: number;
    dateApproved?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.BASE_URL}/v1/payments/${params.paymentId}`, {
        headers: {
          'Authorization': `Bearer ${params.accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `Erro ao buscar status: ${error}`
        };
      }

      const payment: MercadoPagoPaymentResponse = await response.json();

      return {
        success: true,
        status: payment.status,
        statusDetail: payment.status_detail,
        transactionAmount: payment.transaction_amount,
        dateApproved: payment.date_approved
      };

    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      return {
        success: false,
        error: 'Erro interno ao buscar status'
      };
    }
  }

  /**
   * Cria pagamento com split (comissão da plataforma) - Método legado
   */
  static async createSplitPayment(
    sellerId: string,
    amount: number,
    description: string,
    orderId: string,
    customerEmail: string
  ): Promise<MercadoPagoPaymentResponse> {
    const config = await this.getSellerCredentials(sellerId);
    
    if (!config?.accessToken) {
      throw new Error('Seller não conectado ao Mercado Pago');
    }

    // Calcular comissão da plataforma
    const commissionRate = config.commissionRate || 0.0599; // 5.99%
    const commissionFixedFee = config.commissionFixedFee || 0.50; // R$ 0,50
    const applicationFee = (amount * commissionRate) + commissionFixedFee;

    const paymentData = {
      transaction_amount: amount,
      description,
      payment_method_id: 'pix', // ou 'credit_card', 'debit_card'
      payer: {
        email: customerEmail,
      },
      application_fee: applicationFee,
      metadata: {
        order_id: orderId,
        seller_id: sellerId,
      },
    };

    const response = await fetch(`${this.BASE_URL}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao criar pagamento: ${error}`);
    }

    return await response.json();
  }


  /**
   * Cancela um pagamento
   */
  static async cancelPayment(paymentId: string, sellerId: string): Promise<MercadoPagoPaymentResponse> {
    const config = await this.getSellerCredentials(sellerId);
    
    if (!config?.accessToken) {
      throw new Error('Seller não conectado ao Mercado Pago');
    }

    const response = await fetch(`${this.BASE_URL}/v1/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao cancelar pagamento: ${error}`);
    }

    return await response.json();
  }

  /**
   * Desconecta seller do Mercado Pago
   */
  static async disconnectSeller(sellerId: string): Promise<void> {
    await prisma.sellerPaymentConfig.updateMany({
      where: {
        sellerId,
        provider: 'MERCADO_PAGO',
      },
      data: {
        status: 'DISCONNECTED',
        accessToken: null,
        refreshToken: null,
        userId: null,
        expiresAt: null,
        lastSyncAt: new Date(),
        errorMessage: null,
      },
    });
  }
}
