'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Verificar se estamos em um subdomínio de loja
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    // Lista de subdomínios reservados
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'ckeet'];
    
    // Se não é um subdomínio reservado e não estamos em /shop, redirecionar
    if (!reservedSubdomains.includes(subdomain.toLowerCase())) {
      const pathname = window.location.pathname;
      
      if (pathname === '/' || (!pathname.startsWith('/shop') && !pathname.startsWith('/seller') && !pathname.startsWith('/master') && !pathname.startsWith('/customer') && !pathname.startsWith('/api'))) {
        console.log('🔄 Redirecting to /shop from subdomain:', subdomain);
        router.replace('/shop');
      }
    }
  }, [router]);

  return <>{children}</>;
}
