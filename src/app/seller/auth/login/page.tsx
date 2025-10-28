'use client';

import Image from "next/image";
import Link from "next/link";
import Input from "@/app/components/inputs/input";
import Button from "@/app/components/buttons/button";
import ResendConfirmationModal from "@/app/components/modals/resendConfirmationModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSellerLogin } from "@/lib/hooks/useSellerLogin";
import { loginSchema, type LoginData } from "@/lib/validations/authSchemas";
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
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

  const handleResendConfirmation = async (emailToResend: string) => {
    try {
      const response = await fetch('/api/seller/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToResend }),
      });

      const result = await response.json();

      if (response.ok) {
        showSuccessToast('Email de confirmação reenviado! Verifique sua caixa de entrada.');
      } else {
        showErrorToast(result.error || 'Erro ao reenviar email');
      }
    } catch (error) {
      showErrorToast('Erro ao reenviar email');
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
          {/* Logo e Login */}
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
              Login
            </h2>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="E-mail"
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
            
            <hr className="border-gray-200 my-4" />

            <Button className="w-full mb-2" disabled={isLoading} type="submit">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center">
              <Link href="/seller/auth/register">
                <Button variant="outline" className="w-full">
                  Cadastre-se
                </Button>
              </Link>
            </div>
          </form>
       
          {/* Botão para reenviar confirmação */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsResendModalOpen(true)}
              className="cursor-pointer font-light text-sm text-[var(--primary)] hover:opacity-90"
            >
              Não recebeu o email de confirmação?
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Reenvio de Confirmação */}
      <ResendConfirmationModal
        isOpen={isResendModalOpen}
        onClose={() => setIsResendModalOpen(false)}
        onResend={handleResendConfirmation}
        initialEmail={email}
      />
    </div>
  );
}