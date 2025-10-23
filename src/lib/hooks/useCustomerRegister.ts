import { useState } from 'react';
import { customerRegisterSchema, type CustomerRegisterData } from '@/lib/validations/authSchemas';
import { showToastWithAutoClose } from '@/lib/utils/toastUtils';

interface UseCustomerRegisterReturn {
  isLoading: boolean;
  errors: Record<string, string>;
  register: (data: CustomerRegisterData & { subdomain: string }) => Promise<boolean>;
}

export function useCustomerRegister(): UseCustomerRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const register = async (data: CustomerRegisterData & { subdomain: string }): Promise<boolean> => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validar dados com Zod
      const validatedData = customerRegisterSchema.parse(data);

      // Fazer requisição para a API
      const response = await fetch('/api/customer/auth/register', {
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
        // Se há erros específicos de campo
        if (result.errors) {
          setErrors(result.errors);
          return false;
        }

        // Erro geral
        showToastWithAutoClose('error', result.error || 'Erro ao criar conta', 4000);
        return false;
      }

      // Sucesso
      showToastWithAutoClose('success', result.message || 'Conta criada com sucesso!', 4000);
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

      console.error('Erro no registro:', error);
      showToastWithAutoClose('error', 'Erro interno do servidor', 4000);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errors,
    register,
  };
}
