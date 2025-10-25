// Serviço para integração com a API da Vercel
// Documentação: https://vercel.com/docs/rest-api

import { DOMAIN_CONFIG } from '../config/domains';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN!;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID!;
const VERCEL_API_URL = 'https://api.vercel.com';

// Domínio base para os subdomínios das lojas
const BASE_DOMAIN = DOMAIN_CONFIG.BASE_DOMAIN;

interface VercelDomainResponse {
  name: string;
  verified: boolean;
  created: number;
  projectId?: string;
}

interface VercelErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export class VercelService {
  // Criar um domínio dinâmico no projeto Vercel
  static async createDomain(subdomain: string): Promise<{ success: boolean; domain?: string; error?: string }> {
    try {
      const domain = `${subdomain}.${BASE_DOMAIN}`;

      // Adicionar domínio ao projeto
      const response = await fetch(`${VERCEL_API_URL}/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: domain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as VercelErrorResponse;
        console.error('Erro ao criar domínio na Vercel:', errorData);
        
        // Se o domínio já existe, considerar como sucesso
        if (errorData.error?.code === 'domain_already_exists' || 
            errorData.error?.code === 'domain_already_in_use') {
          return { success: true, domain };
        }
        
        return { 
          success: false, 
          error: errorData.error?.message || 'Erro ao criar domínio na Vercel' 
        };
      }

      const domainData = data as VercelDomainResponse;

      return {
        success: true,
        domain: domainData.name,
      };
    } catch (error) {
      console.error('Erro ao criar domínio na Vercel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar domínio',
      };
    }
  }

  // Remover um domínio do projeto Vercel
  static async removeDomain(domain: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json() as VercelErrorResponse;
        console.error('Erro ao remover domínio da Vercel:', data);
        return {
          success: false,
          error: data.error?.message || 'Erro ao remover domínio da Vercel',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover domínio da Vercel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao remover domínio',
      };
    }
  }

  // Verificar status de um domínio
  static async checkDomain(domain: string): Promise<{ 
    success: boolean; 
    verified?: boolean; 
    error?: string 
  }> {
    try {
      const response = await fetch(
        `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json() as VercelErrorResponse;
        return {
          success: false,
          error: data.error?.message || 'Erro ao verificar domínio',
        };
      }

      const data = await response.json() as VercelDomainResponse;
      return {
        success: true,
        verified: data.verified,
      };
    } catch (error) {
      console.error('Erro ao verificar domínio na Vercel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao verificar domínio',
      };
    }
  }

  // Listar todos os domínios do projeto
  static async listDomains(): Promise<{ success: boolean; domains?: string[]; error?: string }> {
    try {
      const response = await fetch(
        `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json() as VercelErrorResponse;
        return {
          success: false,
          error: data.error?.message || 'Erro ao listar domínios',
        };
      }

      const data = await response.json();
      const domains = data.domains?.map((d: VercelDomainResponse) => d.name) || [];
      
      return {
        success: true,
        domains,
      };
    } catch (error) {
      console.error('Erro ao listar domínios da Vercel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao listar domínios',
      };
    }
  }
}

