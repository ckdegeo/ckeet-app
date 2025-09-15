'use client';

import { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  label?: string;
  error?: string;
  className?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'error';
}

export default function Checkbox({
  label,
  error,
  className = "",
  checked = false,
  onChange,
  size = 'md',
  variant = 'default',
  disabled = false,
  ...props
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 20;
      default:
        return 16;
    }
  };

  const getVariantClasses = () => {
    if (disabled) {
      return 'border-gray-300 bg-gray-100 cursor-not-allowed';
    }

    switch (variant) {
      case 'primary':
        return checked 
          ? 'border-[var(--primary)] bg-[var(--primary)]' 
          : 'border-[var(--primary)] bg-transparent hover:bg-[var(--primary)] hover:bg-opacity-10';
      case 'error':
        return checked 
          ? 'border-[var(--error)] bg-[var(--error)]' 
          : 'border-[var(--error)] bg-transparent hover:bg-[var(--error)] hover:bg-opacity-10';
      default:
        return checked 
          ? 'border-[var(--primary)] bg-[var(--primary)]' 
          : 'border-[var(--on-background)] bg-transparent hover:border-[var(--primary)] hover:bg-[var(--primary)] hover:bg-opacity-10';
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center">
          <input
            {...props}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`
              ${getSizeClasses()}
              rounded
              border-2
              flex items-center justify-center
              transition-all duration-200
              cursor-pointer
              focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:ring-opacity-20
              ${getVariantClasses()}
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            onClick={() => !disabled && onChange && onChange(!checked)}
          >
            {checked && (
              <Check 
                size={getIconSize()} 
                className={`
                  transition-all duration-200
                  ${variant === 'error' ? 'text-[var(--on-error)]' : 'text-[var(--on-primary)]'}
                  ${disabled ? 'text-gray-400' : ''}
                `}
              />
            )}
          </div>
        </div>

        {label && (
          <label 
            className={`
              text-sm font-medium cursor-pointer
              ${disabled 
                ? 'text-gray-400 cursor-not-allowed' 
                : error 
                  ? 'text-[var(--error)]' 
                  : 'text-[var(--foreground)]'
              }
            `}
            onClick={() => !disabled && onChange && onChange(!checked)}
          >
            {label}
          </label>
        )}
      </div>

      {error && (
        <span className="text-sm text-[var(--error)]">
          {error}
        </span>
      )}
    </div>
  );
}