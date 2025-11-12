'use client';

import { InputHTMLAttributes, useState, useEffect, useRef } from "react";
import { Search as SearchIcon, AlertCircle } from "lucide-react";

interface SearchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  titleColor?: string;
}

export default function Search({
  label,
  error,
  className = "",
  primaryColor = '#bd253c',
  secondaryColor = '#970b27',
  borderColor,
  backgroundColor,
  titleColor,
  value,
  defaultValue,
  ...props
}: SearchProps) {
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
        <style dangerouslySetInnerHTML={{
          __html: `
            input[type="search"]::placeholder {
              color: ${titleColor ? `${titleColor}80` : '#9ca3af'} !important;
            }
          `
        }} />
        {label && (
          <label
            className={`
              absolute left-11
              pointer-events-none
              transition-all duration-200
              ${isActive
                ? 'top-0 text-xs -translate-y-1/2 bg-white px-2'
                : 'top-1/2 -translate-y-1/2 text-sm'
              }
              ${isFocused && !error
                ? 'text-[var(--primary)]'
                : error
                ? 'text-red-500'
                : titleColor ? `${titleColor}E6` : '#6b7280'
              }
            `}
            style={{
              '--primary': primaryColor,
              backgroundColor: backgroundColor || '#ffffff',
            } as React.CSSProperties}
          >
            {label}
          </label>
        )}
        <input
          type="search"
          {...props}
          ref={inputRef}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => {
            setIsFocused(true);
            e.target.style.borderColor = primaryColor;
            e.target.style.boxShadow = `0 0 0 3px ${primaryColor}20`;
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            e.target.style.borderColor = error ? '#ef4444' : (borderColor || '#d1d5db');
            e.target.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          className={`
            w-full
            pl-11 pr-4 py-3
            rounded-full
            border
            transition-all
            outline-none
            focus:border-opacity-100
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${error ? "border-red-500" : ""}
            ${label && isActive ? "pt-4 pb-2" : ""}
            ${className}
          `}
          style={{
            backgroundColor: backgroundColor || '#ffffff',
            borderColor: error ? '#ef4444' : (borderColor || '#d1d5db'),
            color: titleColor ? `${titleColor}E6` : '#111827', // 90% opacity
            '--tw-ring-color': primaryColor,
          } as React.CSSProperties}
        />
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: titleColor ? `${titleColor}E6` : (borderColor || '#6b7280') }}
        >
          <SearchIcon size={18} />
        </div>
      </div>

      {error && (
        <div 
          className="flex items-start gap-2 px-4 py-2 bg-red-500/5 border-l-2 border-red-500 rounded-r-lg transition-all duration-200 animate-fade-in"
        >
          <AlertCircle 
            size={16} 
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <span className="text-sm text-red-500 leading-relaxed">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}