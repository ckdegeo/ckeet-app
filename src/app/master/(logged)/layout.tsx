'use client';

import { useState } from 'react';
import Sidebar from '@/app/master/patterns/sidebar';
import Navbar from '@/app/master/patterns/navbar';

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const [pageTitle, setPageTitle] = useState('Master');

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
    </div>
  );
}