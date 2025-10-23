'use client';

import Image from "next/image";
import Link from "next/link";
import Input from "@/app/components/inputs/input";
import Button from "@/app/components/buttons/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSellerLogin } from "@/lib/hooks/useSellerLogin";
import { loginSchema, type LoginData } from "@/lib/validations/authSchemas";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  
  const { isLoading, errors, login } = useSellerLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData: LoginData = {
      email,
      password,
    };

    const success = await login(formData);
    
    if (success) {
      // Redirecionar para dashboard
      router.push('/seller/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Imagem/Banner */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--primary)] items-center justify-center p-8">
        <div className="max-w-md text-[var(--on-primary)]">
          <h1 className="text-4xl font-bold mb-4">
            Ckeet
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

                   {/* Botão para reenviar confirmação */}
                   <div className="text-center">
                     <button
                       type="button"
                       onClick={async () => {
                         const email = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value;
                         if (!email) {
                           alert('Digite seu email primeiro');
                           return;
                         }
                         
                         try {
                           const response = await fetch('/api/seller/auth/resend-confirmation', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ email }),
                           });
                           
                           const result = await response.json();
                           
                           if (response.ok) {
                             alert('Email de confirmação reenviado! Verifique sua caixa de entrada.');
                           } else {
                             alert(result.error || 'Erro ao reenviar email');
                           }
                         } catch (error) {
                           alert('Erro ao reenviar email');
                         }
                       }}
                       className="text-sm text-[var(--primary)] hover:opacity-90 underline"
                     >
                       Não recebeu o email de confirmação? Clique aqui
                     </button>
                   </div>

            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <p className="text-center text-sm text-[var(--on-background)]">
              Não tem uma conta?{" "}
              <Link
                href="/seller/auth/register"
                className="text-[var(--primary)] hover:opacity-90"
              >
                Cadastre-se
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}