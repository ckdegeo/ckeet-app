'use client';

import { InputHTMLAttributes } from "react";

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
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <input
        {...props}
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
      />

      {error && (
        <span className="text-sm text-[var(--error)]">
          {error}
        </span>
      )}
    </div>
  );
}