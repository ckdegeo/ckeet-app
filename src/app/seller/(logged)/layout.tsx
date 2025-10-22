'use client';

import { useState } from 'react';
import Sidebar from '@/app/seller/patterns/sidebar';
import Navbar from '@/app/seller/patterns/navbar';
import DomainModal from '@/app/components/modals/domainModal';
import { useDomainCheck } from '@/lib/hooks/useDomainCheck';
import { useStoreCompletion } from '@/lib/hooks/useStoreCompletion';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [pageTitle, setPageTitle] = useState('Seller');
  const { 
    showDomainModal, 
    setShowDomainModal, 
    domainConfig, 
    saveDomainConfig, 
    isLoading,
    isChecking 
  } = useDomainCheck();
  
  // Verificar completude da loja
  const { storeStatus } = useStoreCompletion();

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar title={pageTitle} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Modal de Domínio - Obrigatório até ser criado */}
      {!isChecking && (
        <DomainModal
          isOpen={showDomainModal}
          onClose={() => setShowDomainModal(false)}
          onSave={saveDomainConfig}
          initialConfig={domainConfig}
          required={true}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}