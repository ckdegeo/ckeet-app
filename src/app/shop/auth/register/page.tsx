'use client';

import Image from "next/image";
import Link from "next/link";
import Input from "@/app/components/inputs/input";
import PhoneInput from "@/app/components/inputs/phoneInput";
import Button from "@/app/components/buttons/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerRegister } from "@/lib/hooks/useCustomerRegister";
import { customerRegisterSchema, type CustomerRegisterData } from "@/lib/validations/authSchemas";
import { Store } from '@/lib/types';
import { validateEmail } from "@/lib/utils/validation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [subdomain, setSubdomain] = useState<string>('');
  const router = useRouter();
  
  const { isLoading, errors, register } = useCustomerRegister();

  // Validação em tempo real para email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Validar apenas se o email estiver completo (contém @)
    if (value.includes('@')) {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        toast.error(validation.error || 'Email inválido', {
          duration: 3000,
        });
      }
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  async function fetchStoreData() {
    try {
      setLoadingStore(true);
      const hostname = window.location.hostname;
      const subdomainFromUrl = hostname.split('.')[0];
      
      // Se for localhost, usar subdomain de teste
      const currentSubdomain = hostname === 'localhost' ? 'loja-teste' : subdomainFromUrl;
      setSubdomain(currentSubdomain);
      
      const response = await fetch(`/api/storefront/store?subdomain=${currentSubdomain}`);
      
      if (response.ok) {
        const data = await response.json();
        setStore(data.store);
      }
    } catch (error) {
      // Erro ao carregar dados da loja
    } finally {
      setLoadingStore(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subdomain) {
      return;
    }

    const formData: CustomerRegisterData & { subdomain: string } = {
      name,
      email,
      phone,
      password,
      confirmPassword,
      subdomain: subdomain,
    };

    const success = await register(formData);
    
    if (success) {
      setSuccess(true);
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/shop/auth/login');
      }, 2000);
    }
  };

  if (loadingStore) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--foreground)]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Conta criada com sucesso!</h2>
          <p className="text-[var(--foreground)] opacity-70">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Imagem/Banner */}
      <div
        className="hidden md:flex md:w-1/2 items-center justify-center p-8 relative"
        style={{ backgroundColor: store?.primaryColor || '#bd253c' }}
      >
        {store?.homeBannerUrl ? (
          <div className="w-full h-full relative">
            <img
              src={store.homeBannerUrl}
              alt="Banner da loja"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ) : null }
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
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
            {/* Nome */}
            <div>
              <Input
                label="Nome completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
                error={errors.name}
                required
                primaryColor={store?.primaryColor}
                secondaryColor={store?.secondaryColor}
              />
            </div>

            {/* Email */}
            <div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Digite seu email"
                required
                primaryColor={store?.primaryColor}
                secondaryColor={store?.secondaryColor}
              />
            </div>

            {/* Telefone */}
            <div>
              <PhoneInput
                label="Telefone"
                value={phone}
                onChange={setPhone}
                placeholder="Digite seu telefone"
                error={errors.phone}
                primaryColor={store?.primaryColor}
                secondaryColor={store?.secondaryColor}
              />
            </div>

            {/* Senha */}
            <div>
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                error={errors.password}
                required
                primaryColor={store?.primaryColor}
                secondaryColor={store?.secondaryColor}
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <Input
                label="Confirmar senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                error={errors.confirmPassword}
                required
                primaryColor={store?.primaryColor}
                secondaryColor={store?.secondaryColor}
              />
            </div>

            {/* Erro geral */}
            {errors.general && (
              <div className="text-red-500 text-sm text-center">
                {errors.general}
              </div>
            )}

            {/* Botão de Cadastro */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
              style={{
                backgroundColor: store?.secondaryColor || '#970b27',
              }}
            >
              {isLoading ? 'Criando conta...' : 'Cadastrar'}
            </Button>

            {/* Link para Login */}
            <div className="text-center">
              <p 
                className="text-[var(--foreground)] opacity-70"
                style={{
                  '--primary': store?.primaryColor || '#bd253c',
                  '--secondary': store?.secondaryColor || '#970b27',
                  '--background': '#ffffff',
                  '--foreground': '#111827',
                  '--on-background': '#6b7280'
                } as React.CSSProperties}
              >
                Já tem uma conta?{' '}
                <Link
                  href="/shop/auth/login"
                  className="text-[var(--primary)] hover:underline font-medium"
                  style={{
                    '--primary': store?.primaryColor || '#bd253c',
                    '--secondary': store?.secondaryColor || '#970b27',
                    '--background': '#ffffff',
                    '--foreground': '#111827',
                    '--on-background': '#6b7280'
                  } as React.CSSProperties}
                >
                  Faça login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}