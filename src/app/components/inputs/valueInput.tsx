'use client';

import { InputHTMLAttributes, ChangeEvent } from "react";

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
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Remove todos os caracteres não numéricos
    const numericValue = e.target.value.replace(/\D/g, '');
    
    // Se estiver vazio, retorna 0 mas não mostra nada no input
    if (!numericValue) {
      onChange(0);
      return;
    }

    // Converte para número considerando os centavos
    const value = parseFloat(numericValue) / 100;
    onChange(value);
  };

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

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {!showCurrencySymbol && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--on-background)]">
            {currencyConfig[currency].symbol}
          </div>
        )}
        <input
          {...props}
          type="text"
          inputMode="decimal"
          value={formatValue(value)}
          onChange={handleChange}
          className={`
            w-full
            px-4 py-3
            ${!showCurrencySymbol ? 'pl-10' : ''}
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
        />
      </div>

      {error && (
        <span className="text-sm text-[var(--error)]">
          {error}
        </span>
      )}
    </div>
  );
}