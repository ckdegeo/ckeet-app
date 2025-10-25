'use client';

import Image from "next/image";
import Link from "next/link";
import Input from "@/app/components/inputs/input";
import Button from "@/app/components/buttons/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerLogin } from "@/lib/hooks/useCustomerLogin";
import { loginSchema, type LoginData } from "@/lib/validations/authSchemas";
import { Store } from '@/lib/types';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [store, setStore] = useState<Store | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [subdomain, setSubdomain] = useState<string>('');
  const router = useRouter();
  
  const { isLoading, errors, login } = useCustomerLogin();

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
      } else {
        console.error('Loja não encontrada para subdomain:', currentSubdomain);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error);
    } finally {
      setLoadingStore(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subdomain) {
      console.error('Subdomain não definido');
      return;
    }

    const formData: LoginData & { subdomain: string } = {
      email,
      password,
      subdomain: subdomain,
    };

    const success = await login(formData);
    
    if (success) {
      // Redirecionar para a loja após login bem-sucedido
      router.push('/shop');
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

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Imagem/Banner */}
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
          </div>
        ) : null }
      </div>

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
              Login do Cliente
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
              primaryColor={store?.primaryColor}
              secondaryColor={store?.secondaryColor}
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
              primaryColor={store?.primaryColor}
              secondaryColor={store?.secondaryColor}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--on-background)] text-[var(--primary)]"
                />
                <span 
                  className="text-sm text-[var(--foreground)]"
                  style={{
                    '--primary': store?.primaryColor || '#6200EE',
                    '--secondary': store?.secondaryColor || '#03DAC6',
                    '--background': '#ffffff',
                    '--foreground': '#111827',
                    '--on-background': '#6b7280'
                  } as React.CSSProperties}
                >
                  Lembrar-me
                </span>
              </label>

              <a
                href="#"
                className="text-sm text-[var(--primary)] hover:opacity-90"
                style={{
                  '--primary': store?.primaryColor || '#6200EE',
                  '--secondary': store?.secondaryColor || '#03DAC6',
                  '--background': '#ffffff',
                  '--foreground': '#111827',
                  '--on-background': '#6b7280'
                } as React.CSSProperties}
              >
                Esqueceu a senha?
              </a>
            </div>

            <Button 
              className="w-full" 
              disabled={isLoading} 
              type="submit"
              style={{
                backgroundColor: store?.secondaryColor || '#03DAC6',
                color: 'white'
              }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <p 
              className="text-center text-sm text-[var(--on-background)]"
              style={{
                '--primary': store?.primaryColor || '#6200EE',
                '--secondary': store?.secondaryColor || '#03DAC6',
                '--background': '#ffffff',
                '--foreground': '#111827',
                '--on-background': '#6b7280'
              } as React.CSSProperties}
            >
              Não tem uma conta?{" "}
              <Link
                href="/shop/auth/register"
                className="text-[var(--primary)] hover:opacity-90"
                style={{
                  '--primary': store?.primaryColor || '#6200EE',
                  '--secondary': store?.secondaryColor || '#03DAC6',
                  '--background': '#ffffff',
                  '--foreground': '#111827',
                  '--on-background': '#6b7280'
                } as React.CSSProperties}
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