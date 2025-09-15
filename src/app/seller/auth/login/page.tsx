'use client';

import Image from "next/image";
import Input from "@/app/components/inputs/input";
import Button from "@/app/components/buttons/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validação básica
      const newErrors: LoginErrors = {};
      
      if (!email) {
        newErrors.email = "Email é obrigatório";
      }
      
      if (!password) {
        newErrors.password = "Senha é obrigatória";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Simular login - aqui você pode implementar sua lógica de autenticação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirecionar para dashboard
      router.push('/seller/dashboard');
      
    } catch (error) {
      console.error('Erro no login:', error);
      setErrors({ email: "Erro ao fazer login. Verifique suas credenciais." });
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
          <div className="flex flex-col items-center gap-2 mb-8">
            <Image
              src="/logo.png"
              alt="Ckeet Logo"
              width={180}
              height={50}
              priority
              className="h-auto"
            />
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              Login do Vendedor
            </h2>
          </div>


          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
              error={errors?.email}
              disabled={isLoading}
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              error={errors?.password}
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--on-background)] text-[var(--primary)]"
                />
                <span className="text-sm text-[var(--foreground)]">
                  Lembrar-me
                </span>
              </label>

              <a
                href="#"
                className="text-sm text-[var(--primary)] hover:opacity-90"
              >
                Esqueceu a senha?
              </a>
            </div>

            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <p className="text-center text-sm text-[var(--on-background)]">
              Não tem uma conta?{" "}
              <a
                href="/seller/auth/register"
                className="text-[var(--primary)] hover:opacity-90"
              >
                Cadastre-se
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}