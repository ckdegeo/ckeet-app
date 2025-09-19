'use client';

import Image from "next/image";
import Input from "@/app/components/inputs/input";
import Button from "@/app/components/buttons/button";
import { useState } from "react";

export default function MasterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de login master
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Imagem/Banner */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--primary)] items-center justify-center p-8">
        <div className="max-w-md text-[var(--on-primary)]">
          <h1 className="text-4xl font-bold mb-4">
            Painel Administrativo
          </h1>
          <p className="text-lg opacity-90">
            Gerencie todas as operações da plataforma em um só lugar
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
              width={80}
              height={80}
              priority
              className="w-20 h-20"
            />
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              Login Administrativo
            </h2>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email administrativo"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
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

            <Button className="w-full">
              Acessar Painel
            </Button>

            <div className="text-center">
              <p className="text-sm text-[var(--error)]">
                Acesso restrito a administradores
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
