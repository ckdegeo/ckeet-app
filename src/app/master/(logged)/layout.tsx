'use client';

import { useState } from 'react';
import Sidebar from '@/app/master/patterns/sidebar';
import Navbar from '@/app/master/patterns/navbar';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { useTokenExpiration, useApiInterceptor } from '@/lib/hooks/useTokenExpiration';

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const [pageTitle, setPageTitle] = useState('Master');
  
  // Verificar expiração do token e interceptar requisições
  useTokenExpiration();
  useApiInterceptor();

  return (
    <AuthGuard redirectTo="/master/auth/login" userType="master">
      <div className="flex min-h-screen bg-[var(--background)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar title={pageTitle} />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 max-w-full">
            <div className="max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}