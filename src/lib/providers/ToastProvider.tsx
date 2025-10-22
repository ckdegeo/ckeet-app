'use client';

import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { clearAllToasts } from '@/lib/utils/toastUtils';

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  useEffect(() => {
    // Limpar toasts antigos ao inicializar
    clearAllToasts();
  }, []);

  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        draggable={false}
        theme="light"
        toastClassName="rounded-lg"
        limit={3}
      />
    </>
  );
}