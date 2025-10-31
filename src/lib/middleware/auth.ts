import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/authService';

// ===========================================
// AUTH MIDDLEWARE
// ===========================================

export class AuthMiddleware {
  // Verificar se usuário está autenticado
  static async verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: 'Token de acesso não fornecido',
        status: 401,
      };
    }

    const accessToken = authHeader.substring(7);

    try {
      const user = await AuthService.verifyToken(accessToken);
      return { user, accessToken };
    } catch (error) {
      return {
        error: 'Token inválido ou expirado',
        status: 401,
      };
    }
  }

  // Verificar se usuário é seller
  static async verifySeller(request: NextRequest) {
    const authResult = await this.verifyAuth(request);
    
    if ('error' in authResult) {
      return authResult;
    }

    try {
      const user = await AuthService.validateSeller(authResult.accessToken);
      return { user, accessToken: authResult.accessToken };
    } catch (error) {
      return {
        error: 'Acesso negado. Apenas vendedores podem acessar esta área.',
        status: 403,
      };
    }
  }

  // Verificar se usuário é customer
  static async verifyCustomer(request: NextRequest) {
    const authResult = await this.verifyAuth(request);
    
    if ('error' in authResult) {
      return authResult;
    }

    try {
      const user = await AuthService.validateCustomer(authResult.accessToken);
      return { user, accessToken: authResult.accessToken };
    } catch (error) {
      return {
        error: 'Acesso negado. Apenas clientes podem acessar esta área.',
        status: 403,
      };
    }
  }

  // Criar resposta de erro
  static createErrorResponse(error: string, status: number) {
    return NextResponse.json({ error }, { status });
  }

  // Criar resposta de sucesso
  static createSuccessResponse(data: unknown, message?: string) {
    return NextResponse.json({
      success: true,
      message,
      data,
    });
  }
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: { id: string; email?: string; user_metadata?: Record<string, unknown> }, accessToken: string) => Promise<NextResponse>
) {
  const authResult = await AuthMiddleware.verifyAuth(request);
  
  if ('error' in authResult) {
    return AuthMiddleware.createErrorResponse(authResult.error || 'Erro de autenticação', authResult.status || 401);
  }

  return handler(request, authResult.user, authResult.accessToken);
}

export async function withSellerAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: { id: string; email?: string; user_metadata?: Record<string, unknown> }, accessToken: string) => Promise<NextResponse>
) {
  const authResult = await AuthMiddleware.verifySeller(request);
  
  if ('error' in authResult) {
    return AuthMiddleware.createErrorResponse(authResult.error || 'Erro de autenticação', authResult.status || 401);
  }

  return handler(request, authResult.user, authResult.accessToken);
}

export async function withCustomerAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: { id: string; email?: string; user_metadata?: Record<string, unknown> }, accessToken: string) => Promise<NextResponse>
) {
  const authResult = await AuthMiddleware.verifyCustomer(request);
  
  if ('error' in authResult) {
    return AuthMiddleware.createErrorResponse(authResult.error || 'Erro de autenticação', authResult.status || 401);
  }

  return handler(request, authResult.user, authResult.accessToken);
}

export async function withMasterAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: { id: string; email?: string; user_metadata?: Record<string, unknown> }, accessToken: string) => Promise<NextResponse>
) {
  const authResult = await AuthMiddleware.verifyAuth(request);

  if ('error' in authResult) {
    return AuthMiddleware.createErrorResponse(authResult.error || 'Erro de autenticação', authResult.status || 401);
  }

  try {
    await AuthService.validateMaster(authResult.accessToken);
  } catch (e) {
    return AuthMiddleware.createErrorResponse('Acesso negado. Apenas administradores.', 403);
  }

  return handler(request, authResult.user, authResult.accessToken);
}