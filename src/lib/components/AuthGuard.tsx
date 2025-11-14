'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isMasterAuthenticated, refreshAuthToken } from '@/lib/utils/authUtils';
import { checkTokenExpiration } from '@/lib/utils/apiClient';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  userType?: 'seller' | 'customer' | 'master';
}

export function AuthGuard({ children, redirectTo = '/seller/auth/login', userType }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se o token expirou primeiro
        checkTokenExpiration();
        
        // Verificar autenticação baseado no tipo de usuário
        let authenticated = false;
        
        if (userType === 'master') {
          authenticated = isMasterAuthenticated();
        } else if (userType === 'customer') {
          // Verificar token de customer
          const customerToken = typeof window !== 'undefined' ? localStorage.getItem('customer_access_token') : null;
          const customerExpiresAt = typeof window !== 'undefined' ? localStorage.getItem('customer_expires_at') : null;
          
          if (customerToken && customerExpiresAt) {
            const expirationTime = parseInt(customerExpiresAt);
            const currentTime = Math.floor(Date.now() / 1000);
            authenticated = currentTime < expirationTime;
          } else {
            authenticated = false;
          }
        } else {
          // Seller (padrão)
          authenticated = isAuthenticated();
        }

        if (authenticated) {
          setIsAuth(true);
        } else {
          // Tentar renovar token se possível (passar userType, mas apenas seller ou master)
          const refreshed = await refreshAuthToken(
            userType === 'customer' ? undefined : (userType as 'seller' | 'master' | undefined)
          );
          if (refreshed) {
            // Verificar novamente após refresh
            if (userType === 'master') {
              authenticated = isMasterAuthenticated();
            } else if (userType === 'customer') {
              const customerToken = typeof window !== 'undefined' ? localStorage.getItem('customer_access_token') : null;
              const customerExpiresAt = typeof window !== 'undefined' ? localStorage.getItem('customer_expires_at') : null;
              
              if (customerToken && customerExpiresAt) {
                const expirationTime = parseInt(customerExpiresAt);
                const currentTime = Math.floor(Date.now() / 1000);
                authenticated = currentTime < expirationTime;
              } else {
                authenticated = false;
              }
            } else {
              authenticated = isAuthenticated();
            }
            
            if (authenticated) {
              setIsAuth(true);
            } else {
              // Token expirado, redirecionar para login
              if (typeof window !== 'undefined') {
                window.location.href = redirectTo;
              }
            }
          } else {
            // Token expirado, redirecionar para login
            if (typeof window !== 'undefined') {
              window.location.href = redirectTo;
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo, userType]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}
