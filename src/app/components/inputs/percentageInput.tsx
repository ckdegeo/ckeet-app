'use client';

import { InputHTMLAttributes, ChangeEvent, useState, useEffect, useRef } from "react";
import { Percent, AlertCircle } from "lucide-react";

interface PercentageInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  className?: string;
  value: number;
  onChange: (value: number) => void;
}

export default function PercentageInput({
  label,
  error,
  className = "",
  value,
  onChange,
  ...props
}: PercentageInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatValue = (num: number) => {
    if (num === 0 && !String(value).includes('.')) return '';
    return num.toString();
  };

  useEffect(() => {
    setHasValue(value !== 0 && !!formatValue(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Remove qualquer caractere que não seja número, ponto ou vírgula
    let newValue = e.target.value.replace(/[^\d.,]/g, '');
    
    // Substitui vírgula por ponto
    newValue = newValue.replace(',', '.');
    
    // Garante que só existe um ponto decimal
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Se estiver vazio, retorna 0
    if (!newValue) {
      setHasValue(false);
      onChange(0);
      return;
    }

    const numericValue = parseFloat(newValue);
    
    // Se não for um número válido, mantém o valor anterior
    if (isNaN(numericValue)) {
      return;
    }

    // Limita o valor entre 0 e 100
    const clampedValue = Math.min(Math.max(numericValue, 0), 100);
    setHasValue(true);
    onChange(clampedValue);
  };

  const isActive = isFocused || hasValue;

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
              '--primary': '#bd253c',
              '--secondary': '#970b27',
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
          {...props}
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={formatValue(value)}
          onChange={handleChange}
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
            pr-12 pl-4 py-3
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
            '--primary': '#bd253c',
            '--secondary': '#970b27',
            '--background': '#ffffff',
            '--foreground': '#111827',
            '--on-background': '#6b7280',
            '--error': '#ef4444'
          } as React.CSSProperties}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--on-background)]">
          <Percent size={18} />
        </div>
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