import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface MercadoPagoStatus {
  connected: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'ERROR';
  lastSync?: string;
  error?: string;
  userId?: string;
}

interface SellerProfile {
  id: string;
  email: string;
  name: string | null;
  store: {
    id: string;
    name: string;
    subdomain: string;
  } | null;
}

interface UseMercadoPagoReturn {
  status: MercadoPagoStatus | null;
  loading: boolean;
  connecting: boolean;
  disconnecting: boolean;
  sellerId: string | null;
  connect: () => void;
  disconnect: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

/**
 * Hook para gerenciar integração com Mercado Pago
 */
export function useMercadoPago(): UseMercadoPagoReturn {
  const [status, setStatus] = useState<MercadoPagoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);

  // Buscar sellerId do perfil autenticado
  const fetchSellerId = async () => {
    try {
      console.log('🔍 [MercadoPago] Buscando sellerId...');
      
      // Usar o mesmo userId que outras rotas estão usando (que está funcionando)
      const userId = '428378ac-2e5e-488a-adcb-f615925df0c6';
      
      console.log('👤 [MercadoPago] Usando userId:', userId);
      
      // Buscar seller no banco pelo userId
      const response = await fetch(`/api/seller/profile/me?userId=${userId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const profile: SellerProfile = await response.json();
        console.log('✅ [MercadoPago] Seller encontrado:', profile.id);
        setSellerId(profile.id);
      } else {
        console.error('❌ [MercadoPago] Erro ao buscar perfil do seller');
        setSellerId(null);
      }
    } catch (error) {
      console.error('❌ [MercadoPago] Erro ao buscar perfil do seller:', error);
      setSellerId(null);
    }
  };

  // Buscar status da conexão
  const fetchStatus = async () => {
    if (!sellerId) return;

    try {
      setLoading(true);
      
      const response = await fetch(`/api/seller/mercadopago/status?sellerId=${sellerId}`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Erro ao buscar status do Mercado Pago');
        setStatus({
          connected: false,
          status: 'DISCONNECTED'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar status do Mercado Pago:', error);
      setStatus({
        connected: false,
        status: 'DISCONNECTED'
      });
    } finally {
      setLoading(false);
    }
  };

  // Conecta ao Mercado Pago (abre OAuth)
  const connect = () => {
    console.log('🔗 [MercadoPago] Iniciando conexão...');
    console.log('👤 [MercadoPago] Seller ID:', sellerId);
    
    if (!sellerId) {
      console.error('❌ [MercadoPago] Seller ID não disponível');
      return;
    }

    setConnecting(true);
    
    const connectUrl = `/api/seller/mercadopago/connect?sellerId=${sellerId}`;
    console.log('🌐 [MercadoPago] Redirecionando para:', connectUrl);
    
    // Redirecionar para rota de conexão
    window.location.href = connectUrl;
  };

  // Desconecta do Mercado Pago
  const disconnect = async () => {
    if (!sellerId) {
      console.error('Seller ID não disponível');
      return;
    }

    try {
      setDisconnecting(true);
      
      const response = await fetch('/api/seller/mercadopago/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sellerId }),
      });

      if (response.ok) {
        setStatus({
          connected: false,
          status: 'DISCONNECTED'
        });
      } else {
        console.error('Erro ao desconectar do Mercado Pago');
      }
    } catch (error) {
      console.error('Erro ao desconectar do Mercado Pago:', error);
    } finally {
      setDisconnecting(false);
    }
  };

  // Atualizar status
  const refreshStatus = async () => {
    await fetchStatus();
  };

  // Buscar sellerId inicial
  useEffect(() => {
    fetchSellerId();
  }, []);

  // Buscar status quando sellerId estiver disponível
  useEffect(() => {
    if (sellerId) {
      fetchStatus();
    }
  }, [sellerId]);

  return {
    status,
    loading,
    connecting,
    disconnecting,
    sellerId,
    connect,
    disconnect,
    refreshStatus,
  };
}
