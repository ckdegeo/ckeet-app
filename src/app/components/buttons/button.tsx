'use client';

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary" | "error" | "outline";
}

export default function Button({
  children,
  className = "",
  variant = "default",
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90";
      case "secondary":
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
      case "error":
        return "bg-red-500 text-white hover:bg-red-600";
      case "outline":
        return "bg-transparent border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)]";
      default:
        return "bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90";
    }
  };

  return (
    <button
      {...props}
      className={`
        cursor-pointer
        flex items-center justify-center gap-2
        px-6 py-3
        rounded-full
        font-medium
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${getVariantStyles()}
        ${className}
      `}
    >
      {children}
    </button>
  );
}