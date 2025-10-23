'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StorefrontRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar imediatamente para /shop
    router.replace('/shop');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando sua loja...</p>
      </div>
    </div>
  );
}
