'use client';

import Image from "next/image";
import Link from "next/link";
import Input from "@/app/components/inputs/input";
import PhoneInput from "@/app/components/inputs/phoneInput";
import Button from "@/app/components/buttons/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { type SellerRegisterData } from "@/lib/validations/authSchemas";
import { validateEmail, validateCPF } from "@/lib/utils/validation";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Email: validar somente ao sair do campo (onBlur) para não floodar toasts
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(undefined);
  };

  const handleEmailBlur = () => {
    if (!email) return;
    const validation = validateEmail(email);
    setEmailError(validation.isValid ? undefined : (validation.error || 'E-mail inválido'));
  };

  // Validação em tempo real para CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      setCpf(cleanValue);
      
      // Validar apenas se o CPF estiver completo (11 dígitos)
      if (cleanValue.length === 11) {
        const validation = validateCPF(cleanValue);
        if (!validation.isValid) {
          toast.error(validation.error || 'CPF inválido', {
            duration: 3000,
          });
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar senhas
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'E-mail inválido');
      return;
    }

    // Validar CPF
    if (cpf.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    const cpfValidation = validateCPF(cpf);
    if (!cpfValidation.isValid) {
      toast.error(cpfValidation.error || 'CPF inválido');
      return;
    }

    // Verificar se conta já existe no banco de dados
    setIsLoading(true);
    try {
      const checkResponse = await fetch('/api/seller/auth/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, cpf }),
      });

      const checkResult = await checkResponse.json();

      if (!checkResponse.ok || checkResult.exists) {
        // Se houver erros específicos, mostrar mensagens apropriadas
        if (checkResult.errors?.email) {
          setEmailError(checkResult.errors.email);
          toast.error(checkResult.errors.email);
        }
        if (checkResult.errors?.cpf) {
          toast.error(checkResult.errors.cpf);
        }
        // Se não houver erros específicos, mostrar erro genérico
        if (!checkResult.errors) {
          toast.error('Erro ao verificar dados. Tente novamente.');
        }
        setIsLoading(false);
        return;
      }

      // Se a verificação passou, salvar dados e redirecionar
      const registerData: SellerRegisterData = {
        name,
        email,
        cpf,
        phone,
        password,
        confirmPassword,
      };

      sessionStorage.setItem('sellerRegisterData', JSON.stringify(registerData));
      router.push('/seller/auth/create-store');
    } catch (error) {
      toast.error('Erro ao verificar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Banner */}
      <div className="hidden md:flex md:w-1/2 relative border-r border-gray-200">
        <Image
          src="/init_banner.png"
          alt="Ckeet - Sua lojinha virtual em minutos"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo e Cadastro */}
          <div className="flex items-center justify-between mb-8">
            <Image
              src="/logo.png"
              alt="Ckeet Logo"
              width={100}
              height={100}
              priority
              className="h-auto"
            />
            <h2 className="text-md font-semibold text-[var(--foreground)]">
              Cadastro
            </h2>
          </div>

          <hr className="border-gray-200 my-4" />


          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nome completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              required
              error={errors?.name}
              disabled={isLoading}
            />

            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="Digite seu email"
              required
              disabled={isLoading}
              error={errors?.email || emailError}
            />

            <Input
              label="CPF"
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              placeholder="Digite seu CPF"
              maxLength={14}
              required
              disabled={isLoading}
            />

            <PhoneInput
              label="Telefone"
              value={phone}
              onChange={setPhone}
              className="bg-transparent"
              error={errors?.phone}
              disabled={isLoading}
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha (mín. 6 caracteres)"
              required
              error={errors?.password}
              disabled={isLoading}
            />

            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
              error={errors?.confirmPassword}
              disabled={isLoading}
            />

            <Button 
              className="w-full mb-2" 
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Validando...' : 'Continuar'}
            </Button>

            <div className="text-center">
              <Link href="/seller/auth/login">
                <Button variant="outline" className="w-full">
                  Faça login
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}