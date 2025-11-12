import { useState } from 'react';
import { loginSchema, type LoginData } from '@/lib/validations/authSchemas';
import { showToastWithAutoClose } from '@/lib/utils/toastUtils';
import { saveAuthData } from '@/lib/utils/authUtils';
import { saveAuthCookies } from '@/lib/utils/cookieUtils';

interface UseCustomerLoginReturn {
  isLoading: boolean;
  errors: Record<string, string>;
  login: (data: LoginData & { subdomain: string }) => Promise<boolean>;
}

export function useCustomerLogin(): UseCustomerLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const login = async (data: LoginData & { subdomain: string }): Promise<boolean> => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validar dados com Zod
      const validatedData = loginSchema.parse(data);

      // Fazer requisição para a API
      const response = await fetch('/api/customer/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...validatedData,
          subdomain: data.subdomain,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erro no login:', response.status, result);
        
        // Se há erros específicos de campo
        if (result.errors) {
          setErrors(result.errors);
          return false;
        }

        // Erro geral - mensagens mais específicas baseadas no status
        let errorMessage = result.error || 'Erro ao fazer login';
        
        if (response.status === 404) {
          if (result.error?.includes('Loja não encontrada')) {
            errorMessage = 'Loja não encontrada. Verifique o subdomain.';
          } else if (result.error?.includes('Cliente não encontrado')) {
            errorMessage = 'Cliente não encontrado nesta loja. Faça o cadastro primeiro.';
          }
        } else if (response.status === 401) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (response.status === 403) {
          errorMessage = result.error || 'Acesso negado.';
        }
        
        // Se for erro de rate limit (429), mostrar toast mais longo
        const duration = response.status === 429 ? 8000 : 4000;
        showToastWithAutoClose('error', errorMessage, duration);
        return false;
      }

      // Sucesso - salvar dados de autenticação
      if (result.tokens && result.user) {
        // Salvar no localStorage com chaves específicas de customer
        localStorage.setItem('customer_user_data', JSON.stringify(result.user));
        localStorage.setItem('customer_access_token', result.tokens.access_token);
        localStorage.setItem('customer_refresh_token', result.tokens.refresh_token);
        localStorage.setItem('customer_expires_at', result.tokens.expires_at.toString());
        
        // Salvar nos cookies para o middleware
        saveAuthCookies(result.user, result.tokens);
      }

      showToastWithAutoClose('success', result.message || 'Login realizado com sucesso!', 4000);
      return true;

    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        // Erros de validação do Zod
        const zodErrors = JSON.parse(error.message);
        const fieldErrors: Record<string, string> = {};
        
        zodErrors.forEach((err: { path: string[]; message: string }) => {
          fieldErrors[err.path[0]] = err.message;
        });
        
        setErrors(fieldErrors);
        return false;
      }

      console.error('Erro no login:', error);
      showToastWithAutoClose('error', 'Erro interno do servidor', 4000);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errors,
    login,
  };
}
