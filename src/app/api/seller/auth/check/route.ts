import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { validateEmail, validateCPF } from '@/lib/utils/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { email, cpf } = await request.json();

    // Validar que pelo menos um campo foi enviado
    if (!email && !cpf) {
      return NextResponse.json(
        { error: 'Email ou CPF deve ser fornecido' },
        { status: 400 }
      );
    }

    const errors: { email?: string; cpf?: string } = {};

    // Verificar email se fornecido
    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error || 'E-mail inválido';
      } else {
        const existingSeller = await AuthService.getSellerByEmail(email);
        if (existingSeller) {
          errors.email = 'Email já cadastrado';
        }
      }
    }

    // Verificar CPF se fornecido
    if (cpf) {
      const cpfValidation = validateCPF(cpf);
      if (!cpfValidation.isValid) {
        errors.cpf = cpfValidation.error || 'CPF inválido';
      } else {
        const existingCpf = await AuthService.getSellerByCpf(cpf);
        if (existingCpf) {
          errors.cpf = 'CPF já cadastrado';
        }
      }
    }

    // Se houver erros, retornar
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          exists: true,
          errors 
        },
        { status: 409 }
      );
    }

    // Se não houver erros, retornar sucesso
    return NextResponse.json({
      exists: false,
      message: 'Dados disponíveis para cadastro'
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

