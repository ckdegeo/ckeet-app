'use client';

import { useState, useEffect } from 'react';

interface SwitchButtonProps {
  label?: string;
  description?: string;
  error?: string;
  className?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function SwitchButton({
  label,
  description,
  error,
  className = "",
  value,
  onChange,
  disabled = false,
  size = 'md'
}: SwitchButtonProps) {
  const [isChecked, setIsChecked] = useState(value);

  useEffect(() => {
    setIsChecked(value);
  }, [value]);

  const handleChange = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue);
  };

  const sizes = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label e Descrição */}
      <div className="flex flex-col">
        {label && (
          <label className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-[var(--on-background)]">
            {description}
          </p>
        )}
      </div>

      {/* Switch */}
      <button
        role="switch"
        aria-checked={isChecked}
        onClick={handleChange}
        disabled={disabled}
        className={`
          relative inline-flex shrink-0
          ${sizes[size].switch}
          rounded-full
          border-2
          outline-none
          transition-colors
          duration-200
          ease-in-out
          ${disabled 
            ? 'opacity-50 cursor-not-allowed border-[var(--on-background)]' 
            : 'cursor-pointer hover:border-[var(--primary)]'
          }
          ${isChecked 
            ? 'bg-[var(--primary)] border-[var(--primary)]' 
            : 'bg-[var(--background)] border-[var(--on-background)]'
          }
        `}
      >
        <span
          className={`
            pointer-events-none
            inline-block
            ${sizes[size].thumb}
            transform
            rounded-full
            bg-[var(--on-primary)]
            shadow
            ring-0
            transition
            duration-200
            ease-in-out
            ${isChecked ? sizes[size].translate : 'translate-x-0'}
            ${!isChecked && 'bg-[var(--thumb-off)]'}
          `}
        />
      </button>

      {/* Erro */}
      {error && (
        <span className="text-sm text-[var(--error)]">
          {error}
        </span>
      )}
    </div>
  );
}