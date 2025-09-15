'use client';

import Image from "next/image";
import Input from "@/app/components/inputs/input";
import PhoneInput from "@/app/components/inputs/phoneInput";
import Button from "@/app/components/buttons/button";
import { useState } from "react";

export default function CustomerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de registro de cliente
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Lado Esquerdo - Imagem/Banner */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--primary)] items-center justify-center p-8">
        <div className="max-w-md text-[var(--on-primary)]">
          <h1 className="text-4xl font-bold mb-4">
            Crie sua conta
          </h1>
          <p className="text-lg opacity-90">
            Junte-se a milhares de clientes e tenha acesso a ofertas exclusivas
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <Image
              src="/seller-logo.png"
              alt="Logo"
              width={180}
              height={50}
              priority
              className="h-auto"
            />
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">
              Cadastro de Cliente
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
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />

            <Input
              label="CPF"
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
              placeholder="Digite seu CPF"
              maxLength={11}
              required
            />

            <PhoneInput
              label="Telefone"
              value={phone}
              onChange={setPhone}
              className="bg-transparent"
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />

            <Input
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
            />

            <Button className="w-full">
              Cadastrar
            </Button>

            <p className="text-center text-sm text-[var(--on-background)]">
              Já tem uma conta?{" "}
              <a
                href="/auth/login"
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