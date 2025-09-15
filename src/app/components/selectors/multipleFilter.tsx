'use client';

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultipleFilterProps {
  label?: string;
  error?: string;
  className?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MultipleFilter({
  label,
  error,
  className = "",
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  disabled = false,
}: MultipleFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    
    onChange(newValue);
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full
            px-4 py-3
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
            text-left
            flex items-center justify-between
            ${error ? "border-[var(--error)]" : ""}
            ${className}
          `}
          disabled={disabled}
        >
          <span className={value.length === 0 ? "text-[var(--on-background)]" : ""}>
            {value.length === 0
              ? placeholder
              : `${value.length} selecionado${value.length !== 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-2">
            {value.length > 0 && (
              <div
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="p-1 hover:bg-[var(--primary)] hover:bg-opacity-10 rounded-full transition-colors cursor-pointer"
              >
                <X size={14} className="text-[var(--on-background)]" />
              </div>
            )}
            <ChevronDown
              size={18}
              className={`text-[var(--on-background)] transition-transform ${
                isOpen ? "transform rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && !disabled && (
          <div className="
            absolute z-10 w-full mt-1
            bg-[var(--background)]
            border border-[var(--on-background)]
            rounded-2xl
            py-1
            max-h-60 overflow-y-auto
            shadow-lg
          ">
            {options.map((option) => (
              <div
                key={option.value}
                role="button"
                onClick={() => toggleOption(option.value)}
                className="
                  w-full px-4 py-2
                  flex items-center justify-between
                  hover:bg-[var(--primary)] hover:bg-opacity-10
                  transition-colors
                  text-[var(--foreground)]
                  cursor-pointer"
              >
                {option.label}
                {value.includes(option.value) && (
                  <Check size={16} className="text-[var(--primary)]" />
                )}
              </div>
            ))}
          </div>
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