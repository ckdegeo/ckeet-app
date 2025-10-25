'use client';

import { InputHTMLAttributes } from "react";

// Função para formatar telefone brasileiro
function formatBrazilianPhone(phone: string): string {
  // Remover todos os caracteres não numéricos
  const clean = phone.replace(/\D/g, '');
  
  // Limitar a 11 dígitos
  const limited = clean.slice(0, 11);
  
  if (limited.length === 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  } else if (limited.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }
  
  // Se não tem o tamanho completo, retornar formatação parcial
  if (limited.length >= 2) {
    if (limited.length <= 6) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else if (limited.length <= 10) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    }
  }
  
  return limited;
}

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
  primaryColor?: string;
  secondaryColor?: string;
  value: string; // Deve estar no formato brasileiro: (11) 99999-9999
  onChange: (value: string) => void; // Retorna no formato brasileiro: (11) 99999-9999
}

export default function PhoneInput({
  label,
  error,
  className = "",
  value,
  onChange,
  placeholder = "Digite seu telefone",
  primaryColor = '#6200EE',
  secondaryColor = '#03DAC6',
  ...props
}: PhoneInputProps) {
  // Função para lidar com mudanças e formatar o telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Formatar automaticamente para o padrão brasileiro
    const formattedPhone = formatBrazilianPhone(input);
    onChange(formattedPhone);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        maxLength={15} // (XX) XXXXX-XXXX = 15 caracteres
        className={`
          w-full
          px-4 py-3
          rounded-full
          bg-transparent
          border border-[var(--on-background)]
          text-[var(--foreground)]
          placeholder:text-[var(--on-background)]
          transition-all
          outline-none
          focus:border-[var(--primary)]
          disabled:opacity-50
          disabled:cursor-not-allowed
          ${error ? "border-[var(--error)]" : ""}
          ${className}
        `}
        style={{
          '--primary': primaryColor,
          '--secondary': secondaryColor,
          '--background': '#ffffff',
          '--foreground': '#111827',
          '--on-background': '#6b7280',
          '--error': '#ef4444'
        } as React.CSSProperties}
        {...props}
      />

      {error && (
        <span className="text-sm text-[var(--error)]">
          {error}
        </span>
      )}
    </div>
  );
}