'use client';

import { InputHTMLAttributes, ChangeEvent } from "react";
import { Percent } from "lucide-react";

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
    onChange(clampedValue);
  };

  const formatValue = (num: number) => {
    if (num === 0 && !String(value).includes('.')) return '';
    return num.toString();
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <input
          {...props}
          type="text"
          inputMode="decimal"
          value={formatValue(value)}
          onChange={handleChange}
          className={`
            w-full
            pr-12 pl-4 py-3
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
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--on-background)]">
          <Percent size={18} />
        </div>
      </div>

      {error && (
        <span className="text-sm text-[var(--error)]">
          {error}
        </span>
      )}
    </div>
  );
}