'use client';

import { InputHTMLAttributes, useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function Input({
  label,
  error,
  className = "",
  primaryColor = '#bd253c',
  secondaryColor = '#970b27',
  value,
  defaultValue,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentValue = value ?? defaultValue ?? inputRef.current?.value ?? '';
    setHasValue(!!currentValue);
  }, [value, defaultValue]);

  const isActive = isFocused || hasValue;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative w-full">
        {label && (
          <label
            className={`
              absolute
              pointer-events-none
              transition-all duration-200
              ${isActive
                ? 'top-0 left-3 text-xs -translate-y-1/2 bg-[var(--background)] px-2 z-20'
                : 'top-1/2 left-4 -translate-y-1/2 text-sm z-0'
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
          {...props}
          ref={inputRef}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          className={`
            w-full
            px-4
            rounded-full
            bg-transparent
            border border-[var(--on-background)]
            text-[var(--foreground)]
            ${label ? "placeholder:text-transparent" : "placeholder:text-[var(--on-background)]/50"}
            transition-all
            outline-none
            focus:border-[var(--primary)]
            disabled:opacity-50
            disabled:cursor-not-allowed
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