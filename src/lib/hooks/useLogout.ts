import { useRouter } from 'next/navigation';
import { clearAuthData } from '@/lib/utils/authUtils';
import { clearAuthCookies } from '@/lib/utils/cookieUtils';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      // Limpar dados do localStorage
      clearAuthData();
      
      // Limpar cookies
      clearAuthCookies();
      
      // Mostrar toast de sucesso
      showSuccessToast('Logout realizado com sucesso!');
      
      // Redirecionar para login
      router.push('/seller/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      showErrorToast('Erro ao fazer logout');
    }
  };

  return { logout };
}
