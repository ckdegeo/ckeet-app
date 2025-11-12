'use client';

import { InputHTMLAttributes, ChangeEvent, useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'ARS' | 'CLP' | 'MXN' | 'PEN' | 'UYU';

interface ValueInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  className?: string;
  value: number;
  onChange: (value: number) => void;
  currency?: CurrencyCode;
  showCurrencySymbol?: boolean;
}

const currencyConfig: Record<CurrencyCode, { symbol: string; locale: string }> = {
  BRL: { symbol: 'R$', locale: 'pt-BR' },
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  ARS: { symbol: '$', locale: 'es-AR' },
  CLP: { symbol: '$', locale: 'es-CL' },
  MXN: { symbol: '$', locale: 'es-MX' },
  PEN: { symbol: 'S/', locale: 'es-PE' },
  UYU: { symbol: '$', locale: 'es-UY' }
};

export default function ValueInput({
  label,
  error,
  className = "",
  value,
  onChange,
  currency = 'BRL',
  showCurrencySymbol = true,
  ...props
}: ValueInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatValue = (num: number) => {
    // Se for zero, retorna string vazia para permitir edição livre
    if (num === 0) return '';
    
    const formatter = new Intl.NumberFormat(currencyConfig[currency].locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: showCurrencySymbol ? 'currency' : 'decimal',
      currency: currency
    });

    // Remove o símbolo da moeda se não for para mostrar
    let formattedValue = formatter.format(num);
    if (!showCurrencySymbol) {
      formattedValue = formattedValue.replace(currencyConfig[currency].symbol, '').trim();
    }

    return formattedValue;
  };

  useEffect(() => {
    setHasValue(value !== 0 && !!formatValue(value));
  }, [value, currency, showCurrencySymbol]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Remove todos os caracteres não numéricos
    const numericValue = e.target.value.replace(/\D/g, '');
    
    // Se estiver vazio, retorna 0 mas não mostra nada no input
    if (!numericValue) {
      setHasValue(false);
      onChange(0);
      return;
    }

    // Converte para número considerando os centavos
    const newValue = parseFloat(numericValue) / 100;
    setHasValue(true);
    onChange(newValue);
  };

  const isActive = isFocused || hasValue;
  const labelLeftPosition = !showCurrencySymbol ? 'left-10' : 'left-4';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative w-full">
        {label && (
          <label
            className={`
              absolute ${labelLeftPosition}
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
        {!showCurrencySymbol && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--on-background)]">
            {currencyConfig[currency].symbol}
          </div>
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
            px-4 py-3
            ${!showCurrencySymbol ? 'pl-10' : ''}
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