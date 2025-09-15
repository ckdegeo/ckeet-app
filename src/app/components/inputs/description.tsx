'use client';

import { TextareaHTMLAttributes } from "react";

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
  ...props
}: DescriptionProps) {
  const charCount = props.value?.toString().length || 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <textarea
          {...props}
          maxLength={maxLength}
          className={`
            w-full
            min-h-[120px]
            px-4 py-3
            rounded-2xl
            bg-transparent
            border border-[var(--on-background)]
            text-[var(--foreground)]
            placeholder:text-[var(--on-background)]
            transition-all
            outline-none
            focus:border-[var(--primary)]
            disabled:opacity-50
            disabled:cursor-not-allowed
            resize-y
            ${error ? "border-[var(--error)]" : ""}
            ${className}
          `}
        />

        {showCharCount && maxLength && (
          <div className="absolute bottom-2 right-3 text-xs text-[var(--on-background)]">
            {charCount}/{maxLength}
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