import { useRouter } from 'next/navigation';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';
import { clearAllCache } from '@/lib/utils/cacheUtils';

export function useCustomerLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      console.log('🔴 INICIANDO LOGOUT CUSTOMER...');
      
      // Obter o token de acesso do localStorage
      const accessToken = localStorage.getItem('customer_access_token');
      console.log('🔍 Token encontrado:', accessToken ? 'SIM' : 'NÃO');
      
      // Fazer logout na API
      if (accessToken) {
        console.log('📡 Enviando requisição para API de logout...');
        const response = await fetch('/api/customer/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: accessToken
          }),
        });

        console.log('📡 Resposta da API:', response.status, response.ok);

        if (response.ok) {
          console.log('✅ Logout API realizado com sucesso');
        } else {
          console.log('⚠️ Erro na API, mas continuando com limpeza local');
        }
      }

      // Limpar dados do localStorage
      console.log('🧹 Limpando dados do localStorage...');
      localStorage.removeItem('customer_access_token');
      localStorage.removeItem('customer_user_data');
      localStorage.removeItem('customer_refresh_token');
      localStorage.removeItem('customer_expires_at');
      
      // Limpar cache da aplicação
      clearAllCache();
      
      console.log('✅ Logout concluído com sucesso');
      
      // Mostrar toast de sucesso
      showSuccessToast('Logout realizado com sucesso!');
      
      // Redirecionar para a página principal da loja
      window.location.href = '/shop';
      
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      showErrorToast('Erro ao fazer logout');
    }
  };

  return { logout };
}
