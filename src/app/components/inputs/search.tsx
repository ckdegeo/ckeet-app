'use client';

import { InputHTMLAttributes } from "react";
import { Search as SearchIcon } from "lucide-react";

interface SearchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export default function Search({
  label,
  error,
  className = "",
  ...props
}: SearchProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        <input
          type="search"
          {...props}
          className={`
            w-full
            pl-11 pr-4 py-3
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
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--on-background)]">
          <SearchIcon size={18} />
        </div>
      </div>

      {error && (
        <span className="text-sm text-[var(--error)]">
          {error}
        </span>
      )}
    </div>
  );
}