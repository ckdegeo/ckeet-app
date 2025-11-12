'use client';

import { TextareaHTMLAttributes, useState, useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

interface DescriptionProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export default function Description({
  label,
  error,
  className = "",
  maxLength,
  showCharCount = true,
  value,
  defaultValue,
  ...props
}: DescriptionProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const currentValue = value ?? defaultValue ?? textareaRef.current?.value ?? '';
    setHasValue(!!currentValue);
  }, [value, defaultValue]);

  const isActive = isFocused || hasValue;
  const charCount = (value ?? defaultValue ?? textareaRef.current?.value ?? '').toString().length || 0;

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
                : 'top-3 text-sm'
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
        <textarea
          {...props}
          ref={textareaRef}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
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
            min-h-[120px]
            px-4 py-3
            rounded-2xl
            bg-transparent
            border border-[var(--on-background)]
            text-[var(--foreground)]
            placeholder:text-transparent
            transition-all
            outline-none
            focus:border-[var(--primary)]
            disabled:opacity-50
            disabled:cursor-not-allowed
            resize-y
            ${error ? "border-[var(--error)]" : ""}
            ${label && isActive ? "pt-4" : ""}
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

        {showCharCount && maxLength && (
          <div className="absolute bottom-2 right-3 text-xs text-[var(--on-background)]">
            {charCount}/{maxLength}
          </div>
        )}
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