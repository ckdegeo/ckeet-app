import { useRouter } from 'next/navigation';
import { clearAuthData } from '@/lib/utils/authUtils';
import { clearAuthCookies } from '@/lib/utils/cookieUtils';
import { toast } from 'react-toastify';
import { toastConfig } from '@/lib/utils/toastUtils';

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      // Limpar dados do localStorage
      clearAuthData();
      
      // Limpar cookies
      clearAuthCookies();
      
      // Mostrar toast de sucesso
      toast.success('Logout realizado com sucesso!', toastConfig);
      
      // Redirecionar para login
      router.push('/seller/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout', toastConfig);
    }
  };

  return { logout };
}
