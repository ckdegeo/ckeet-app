'use client';

import React from 'react';
import { useLogout } from '@/lib/hooks/useLogout';
import Button from '@/app/components/buttons/button';

export function LogoutButton({ className, children }) {
  const { logout } = useLogout();

  return (
    <Button 
      onClick={logout}
      className={className}
      variant="outline"
    >
      {children || 'Sair'}
    </Button>
  );
}
