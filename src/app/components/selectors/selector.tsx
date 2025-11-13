'use client';

import { SelectHTMLAttributes, useState, useEffect, useRef } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

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
  primaryColor?: string;
  secondaryColor?: string;
}

export default function Selector({
  label,
  error,
  className = "",
  options,
  value,
  onChange,
  primaryColor = '#bd253c',
  secondaryColor = '#970b27',
  ...props
}: SelectorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const currentValue = value ?? selectRef.current?.value ?? '';
    setHasValue(!!currentValue);
  }, [value]);

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
        
        <select
          ref={selectRef}
          value={value}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            onChange(e.target.value);
          }}
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
            appearance-none
            px-4
            pr-10
            rounded-full
            bg-transparent
            border border-[var(--on-background)]
            text-[var(--foreground)]
            transition-all
            outline-none
            focus:border-[var(--primary)]
            disabled:opacity-50
            disabled:cursor-not-allowed
            cursor-pointer
            ${error ? "border-[var(--error)]" : ""}
            ${label && isActive ? "pt-4 pb-2" : "py-3"}
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