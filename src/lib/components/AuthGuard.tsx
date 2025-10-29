'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isMasterAuthenticated, refreshAuthToken } from '@/lib/utils/authUtils';

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
        // Verificar autenticação baseado no tipo de usuário
        let authenticated = false;
        
        if (userType === 'master') {
          authenticated = isMasterAuthenticated();
        } else if (userType === 'customer') {
          // Pode adicionar isCustomerAuthenticated se necessário
          authenticated = isAuthenticated();
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
            } else {
              authenticated = isAuthenticated();
            }
            
            if (authenticated) {
              setIsAuth(true);
            } else {
              router.push(redirectTo);
            }
          } else {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push(redirectTo);
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
