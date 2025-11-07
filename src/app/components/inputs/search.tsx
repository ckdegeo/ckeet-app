'use client';

import { InputHTMLAttributes } from "react";
import { Search as SearchIcon } from "lucide-react";

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
  ...props
}: SearchProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <style dangerouslySetInnerHTML={{
          __html: `
            input[type="search"]::placeholder {
              color: ${titleColor ? `${titleColor}80` : '#9ca3af'} !important;
            }
          `
        }} />
        <input
          type="search"
          {...props}
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
            ${className}
          `}
          style={{
            backgroundColor: backgroundColor || '#ffffff',
            borderColor: error ? '#ef4444' : (borderColor || '#d1d5db'),
            color: titleColor ? `${titleColor}E6` : '#111827', // 90% opacity
            '--tw-ring-color': primaryColor,
          } as React.CSSProperties}
          onFocus={(e) => {
            e.target.style.borderColor = primaryColor;
            e.target.style.boxShadow = `0 0 0 3px ${primaryColor}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : (borderColor || '#d1d5db');
            e.target.style.boxShadow = 'none';
          }}
        />
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: titleColor ? `${titleColor}E6` : (borderColor || '#6b7280') }}
        >
          <SearchIcon size={18} />
        </div>
      </div>

      {error && (
        <span className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}