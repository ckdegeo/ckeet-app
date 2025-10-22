'use client';

import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/utils/authUtils';
import { UserData } from '@/lib/utils/authUtils';

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obter dados do usuário do localStorage
    const userData = getUserData();
    setUser(userData);
    setIsLoading(false);
  }, []);

  // Função para atualizar dados do usuário
  const updateUser = (userData: UserData) => {
    setUser(userData);
  };

  // Função para limpar dados do usuário
  const clearUser = () => {
    setUser(null);
  };

  // Função para atualizar dados do usuário do localStorage
  const refresh = () => {
    const userData = getUserData();
    setUser(userData);
  };

  return {
    user,
    isLoading,
    updateUser,
    clearUser,
    refresh,
    isAuthenticated: !!user,
  };
}
