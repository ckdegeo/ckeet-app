'use client';

import Image from "next/image";
import Link from "next/link";
import Input from "@/app/components/inputs/input";
import PhoneInput from "@/app/components/inputs/phoneInput";
import Button from "@/app/components/buttons/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store } from '@/lib/types';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [store, setStore] = useState<Store | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStoreData();
  }, []);

  async function fetchStoreData() {
    try {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      const response = await fetch(`/api/storefront/store?subdomain=${subdomain}`);
      
      if (response.ok) {
        const data = await response.json();
        setStore(data.store);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error);
    } finally {
      setLoadingStore(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Implementar lógica de registro do customer
      console.log('Registro do customer:', { name, email, cpf, phone, password, confirmPassword });
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      setErrors({ general: 'Erro ao criar conta' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingStore) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Banner da Loja */}
      <div 
        className="hidden md:flex md:w-1/2 items-center justify-center p-8 relative"
        style={{ backgroundColor: store?.primaryColor || '#6200EE' }}
      >
        {store?.homeBannerUrl ? (
          <div className="w-full h-full relative">
            <img
              src={store.homeBannerUrl}
              alt="Banner da loja"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-4">
                  {store.name}
                </h1>
                <p className="text-lg opacity-90">
                  Crie sua conta e comece a comprar
                </p>
              </div>
            </div>
          </div>
        ) : null }</div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {store?.logoUrl ? (
              <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center">
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <Image
                src="/logo.png"
                alt="Ckeet Logo"
                width={120}
                height={120}
                priority
                className="h-auto"
              />
            )}
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              Cadastro de cliente
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
              error={errors?.cpf}
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
              placeholder="Digite sua senha (mín. 6 caracteres)"
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
              style={{ 
                backgroundColor: store?.secondaryColor || '#03DAC6',
                color: 'white'
              }}
            >
              {isLoading ? 'Criando conta...' : success ? '✅ Conta criada!' : 'Cadastrar'}
            </Button>

            <p className="text-center text-sm text-[var(--on-background)]">
              Já tem uma conta?{" "}
              <Link
                href="/shop/auth/login"
                className="text-[var(--primary)] hover:opacity-90"
              >
                Faça login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}