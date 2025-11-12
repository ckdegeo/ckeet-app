'use client';

import { InputHTMLAttributes, useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

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
  primaryColor = '#bd253c',
  secondaryColor = '#970b27',
  ...props
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const isActive = isFocused || hasValue;

  // Função para lidar com mudanças e formatar o telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Formatar automaticamente para o padrão brasileiro
    const formattedPhone = formatBrazilianPhone(input);
    setHasValue(!!formattedPhone);
    onChange(formattedPhone);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative w-full">
        {label && (
          <label
            className={`
              absolute left-4
              pointer-events-none
              transition-all duration-200
              ${isActive
                ? 'top-0 text-xs -translate-y-1/2 bg-[var(--background)] px-2'
                : 'top-1/2 -translate-y-1/2 text-sm'
              }
              ${isFocused && !error
                ? 'text-[var(--primary)]'
                : error
                ? 'text-[var(--error)]'
                : 'text-[var(--on-background)]'
              }
            `}
            style={{
              '--primary': primaryColor,
              '--secondary': secondaryColor,
              '--background': '#ffffff',
              '--foreground': '#111827',
              '--on-background': '#6b7280',
              '--error': '#ef4444'
            } as React.CSSProperties}
          >
            {label}
          </label>
        )}
        <input
          type="tel"
          ref={inputRef}
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          maxLength={15} // (XX) XXXXX-XXXX = 15 caracteres
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full
            px-4 py-3
            rounded-full
            bg-transparent
            border border-[var(--on-background)]
            text-[var(--foreground)]
            placeholder:text-transparent
            transition-all
            outline-none
            focus:border-[var(--primary)]
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${error ? "border-[var(--error)]" : ""}
            ${label && isActive ? "pt-4 pb-2" : ""}
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
      </div>

      {error && (
        <div 
          className="flex items-start gap-2 px-4 py-2 bg-[var(--error)]/5 border-l-2 border-[var(--error)] rounded-r-lg transition-all duration-200 animate-fade-in"
          style={{
            '--error': '#ef4444'
          } as React.CSSProperties}
        >
          <AlertCircle 
            size={16} 
            className="text-[var(--error)] flex-shrink-0 mt-0.5"
            style={{
              '--error': '#ef4444'
            } as React.CSSProperties}
          />
          <span className="text-sm text-[var(--error)] leading-relaxed">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}