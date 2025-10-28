import { useState } from 'react';
import { sellerRegisterSchema, type SellerRegisterData } from '@/lib/validations/authSchemas';
import { showToastWithAutoClose } from '@/lib/utils/toastUtils';
import { saveAuthData } from '@/lib/utils/authUtils';

interface UseSellerRegisterReturn {
  isLoading: boolean;
  errors: Record<string, string>;
  register: (data: SellerRegisterData) => Promise<boolean>;
}

export function useSellerRegister(): UseSellerRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const register = async (data: SellerRegisterData): Promise<boolean> => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validar dados com Zod
      const validatedData = sellerRegisterSchema.parse(data);

      // Fazer requisição para a API
      const response = await fetch('/api/seller/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Se há erros específicos de campo
        if (result.errors) {
          setErrors(result.errors);
          return false;
        }

        // Erro geral
        const errorMessage = result.error || 'Erro ao criar conta';
        // Se for erro de rate limit (429), mostrar toast mais longo
        const duration = response.status === 429 ? 8000 : 4000;
        showToastWithAutoClose('error', errorMessage, duration);
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
