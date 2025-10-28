import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

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
  clearCache: () => void;
}

// Cache para evitar consultas desnecessárias
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para obter chave de cache única por usuário
const getCacheKey = (userId?: string) => {
  const baseKey = 'mercadopago_status';
  if (userId) {
    return `${baseKey}_user_${userId}`;
  }
  return baseKey;
};

interface CachedStatus {
  data: MercadoPagoStatus;
  timestamp: number;
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
  const hasShownToast = useRef(false);

  // Obter userId do token
  const getUserId = () => {
    try {
      // Verificar se estamos no lado do cliente
      if (typeof window === 'undefined') return null;
      
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || null;
      }
    } catch (error) {
      console.error('Erro ao obter userId do token:', error);
    }
    return null;
  };

  // Funções de cache
  const getCachedStatus = (): MercadoPagoStatus | null => {
    try {
      const cacheKey = getCacheKey(getUserId());
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const { data, timestamp }: CachedStatus = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar se o cache ainda é válido
      if (now - timestamp < CACHE_DURATION) {
        return data;
      }
      
      // Cache expirado, remover
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.error('Erro ao ler cache:', error);
      localStorage.removeItem(getCacheKey(getUserId()));
      return null;
    }
  };

  const setCachedStatus = (data: MercadoPagoStatus) => {
    try {
      const cacheKey = getCacheKey(getUserId());
      const cached: CachedStatus = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  };

  // Buscar sellerId do perfil autenticado
  const fetchSellerId = async () => {
    try {
      
      // Buscar sellerId dinamicamente do token de acesso
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setSellerId(null);
        return;
      }

      // Decodificar JWT para obter userId
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = payload.userId || payload.sub;
      
      if (!userId) {
        setSellerId(null);
        return;
      }
      
      // Buscar seller no banco pelo userId
      const response = await fetch(`/api/seller/profile/me?userId=${userId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const profile: SellerProfile = await response.json();
        setSellerId(profile.id);
      } else {
        setSellerId(null);
      }
    } catch (error) {
      setSellerId(null);
    }
  };

  // Buscar status da conexão
  const fetchStatus = async (forceRefresh = false) => {
    if (!sellerId) return;

    // Verificar cache primeiro (se não for refresh forçado)
    if (!forceRefresh) {
      const cachedStatus = getCachedStatus();
      if (cachedStatus) {
        setStatus(cachedStatus);
        return;
      }
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/seller/mercadopago/status?sellerId=${sellerId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Salvar no cache
        setCachedStatus(data);
        
        // Verificar se a conexão mudou de desconectado para conectado
        // Só mostrar toast se não foi mostrado antes e é uma mudança real
        const wasDisconnected = !status?.connected;
        const isNowConnected = data.connected;
        
        if (wasDisconnected && isNowConnected && !hasShownToast.current) {
          toast.success('Conectado ao Mercado Pago com sucesso!');
          hasShownToast.current = true;
        }
        
        setStatus(data);
      } else {
        const errorStatus = {
          connected: false,
          status: 'DISCONNECTED' as const
        };
        setStatus(errorStatus);
        setCachedStatus(errorStatus);
      }
    } catch (error) {
      const errorStatus = {
        connected: false,
        status: 'DISCONNECTED' as const
      };
      setStatus(errorStatus);
      setCachedStatus(errorStatus);
    } finally {
      setLoading(false);
    }
  };

  // Conecta ao Mercado Pago (abre OAuth)
  const connect = () => {
    
    if (!sellerId) {
      return;
    }

    setConnecting(true);
    
    const connectUrl = `/api/seller/mercadopago/connect?sellerId=${sellerId}`;
    
    // Redirecionar para rota de conexão
    window.location.href = connectUrl;
  };

  // Desconecta do Mercado Pago
  const disconnect = async () => {
    if (!sellerId) {
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
        // Atualizar status local
        const disconnectedStatus = {
          connected: false,
          status: 'DISCONNECTED' as const
        };
        setStatus(disconnectedStatus);
        
        // Limpar cache do Mercado Pago
        setCachedStatus(disconnectedStatus);
        
        // Limpar cache de dados de integração também
        clearCache();
        
        toast.success('Desconectado do Mercado Pago com sucesso!');
      } else {
        toast.error('Erro ao desconectar do Mercado Pago');
      }
    } catch (error) {
      toast.error('Erro ao desconectar do Mercado Pago');
    } finally {
      setDisconnecting(false);
    }
  };

  // Atualizar status (força refresh)
  const refreshStatus = async () => {
    await fetchStatus(true);
  };

  // Limpar cache e forçar refresh
  const clearCache = () => {
    const cacheKey = getCacheKey(getUserId());
    localStorage.removeItem(cacheKey);
    hasShownToast.current = false;
    
    // Forçar refresh do status após limpar cache
    if (sellerId) {
      fetchStatus(true);
    }
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
    clearCache,
  };
}
