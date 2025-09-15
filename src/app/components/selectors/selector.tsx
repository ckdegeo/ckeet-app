'use client';

import { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectorProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  className?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export default function Selector({
  label,
  error,
  className = "",
  options,
  value,
  onChange,
  ...props
}: SelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full
            appearance-none
            px-4 py-3
            pr-10
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
            cursor-pointer
            ${error ? "border-[var(--error)]" : ""}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-[var(--background)] text-[var(--foreground)]"
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--on-background)]">
          <ChevronDown size={18} />
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