'use client';

import Image from "next/image";
import Input from "@/app/components/inputs/input";
import PhoneInput from "@/app/components/inputs/phoneInput";
import Button from "@/app/components/buttons/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validação básica
      const newErrors: RegisterErrors = {};
      
      if (!name.trim()) {
        newErrors.name = "Nome é obrigatório";
      }
      
      if (!email.trim()) {
        newErrors.email = "Email é obrigatório";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Email inválido";
      }
      
      if (!phone.trim()) {
        newErrors.phone = "Telefone é obrigatório";
      }
      
      if (!password) {
        newErrors.password = "Senha é obrigatória";
      } else if (password.length < 8) {
        newErrors.password = "Senha deve ter pelo menos 8 caracteres";
      }
      
      if (!confirmPassword) {
        newErrors.confirmPassword = "Confirmação de senha é obrigatória";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Simular registro
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/seller/auth/login');
      }, 2000);

    } catch (error) {
      console.error('Erro no registro:', error);
      setErrors({ email: "Erro ao criar conta. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Imagem/Banner */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--primary)] items-center justify-center p-8">
        <div className="max-w-md text-[var(--on-primary)]">
          <h1 className="text-4xl font-bold mb-4">
            Bem-vindo ao Ckeet
          </h1>
          <p className="text-lg opacity-90">
            Gerencie sua loja online de forma simples e eficiente
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <Image
              src="/logo.png"
              alt="Ckeet Logo"
              width={120}
              height={120}
              priority
              className="w-30 h-30"
            />
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              Cadastro de Vendedor
            </h2>
          </div>


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
              disabled={isLoading || success}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
              error={errors?.email}
              disabled={isLoading || success}
            />

            <Input
              label="CPF"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
              placeholder="Digite seu CPF"
              maxLength={11}
              required
              disabled={isLoading || success}
            />

            <PhoneInput
              label="Telefone"
              value={phone}
              onChange={setPhone}
              className="bg-transparent"
              error={errors?.phone}
              disabled={isLoading || success}
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha (mín. 8 caracteres)"
              required
              error={errors?.password}
              disabled={isLoading || success}
            />

            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
              error={errors?.confirmPassword}
              disabled={isLoading || success}
            />

            <Button 
              className="w-full" 
              disabled={isLoading || success}
              type="submit"
            >
              {isLoading ? 'Criando conta...' : success ? '✅ Conta criada!' : 'Cadastrar'}
            </Button>

            <p className="text-center text-sm text-[var(--on-background)]">
              Já tem uma conta?{" "}
              <a
                href="/seller/auth/login"
                className="text-[var(--primary)] hover:opacity-90"
              >
                Faça login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}