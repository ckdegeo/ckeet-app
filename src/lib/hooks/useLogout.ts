import { useRouter } from 'next/navigation';
import { clearAuthData, getUserData, logout as logoutApi } from '@/lib/utils/authUtils';
import { clearAuthCookies } from '@/lib/utils/cookieUtils';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
import { clearAllCache } from '@/lib/utils/cacheUtils';

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    // Obter tipo de usuário antes de limpar (fazer isso primeiro)
    const userData = getUserData();
    const userType = userData?.user_type;
    
    try {
      // Chamar API de logout se houver token
      await logoutApi(userType as 'seller' | 'master' | undefined);
      
      // Limpar dados do localStorage
      clearAuthData();
      
      // Limpar cookies
      clearAuthCookies();
      
      // Limpar cache da aplicação
      clearAllCache();
      
      // Mostrar toast de sucesso
      showSuccessToast('Logout realizado com sucesso!');
      
      // Redirecionar para login baseado no tipo de usuário
      if (userType === 'master') {
        router.push('/master/auth/login');
      } else if (userType === 'customer') {
        // Se necessário, adicionar rota de login do customer
        router.push('/shop/auth/login');
      } else {
        router.push('/seller/auth/login');
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      showErrorToast('Erro ao fazer logout');
      
      // Mesmo em caso de erro, limpar dados localmente e redirecionar
      clearAuthData();
      clearAuthCookies();
      clearAllCache();
      
      // Usar userType já obtido antes
      if (userType === 'master') {
        router.push('/master/auth/login');
      } else {
        router.push('/seller/auth/login');
      }
    }
  };

  return { logout };
}
