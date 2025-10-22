'use client';

import React from 'react';
import { useLogout } from '@/lib/hooks/useLogout';
import Button from '@/app/components/buttons/button';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const { logout } = useLogout();

  return (
    <Button 
      onClick={logout}
      className={className}
      variant="secondary"
    >
      {children || 'Sair'}
    </Button>
  );
}
