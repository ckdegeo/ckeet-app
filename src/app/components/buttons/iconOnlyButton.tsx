'use client';

import { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface IconOnlyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  className?: string;
  isActive?: boolean;
  variant?: "default" | "primary" | "surface" | "error";
}

export default function IconOnlyButton({
  icon: Icon,
  className = "",
  isActive = false,
  variant = "default",
  ...props
}: IconOnlyButtonProps) {
  const getVariantStyles = () => {
    if (isActive) {
      return "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-variant)]";
    }
    
    switch (variant) {
      case "primary":
        return "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-variant)]";
      case "surface":
        return "bg-[var(--surface)] text-[var(--on-surface)] hover:bg-gray-100 border border-gray-200 hover:border-gray-300";
      case "error":
        return "bg-[var(--error)] text-[var(--on-error)] hover:bg-red-700";
      default:
        return "bg-[var(--surface)] text-[var(--on-surface)] hover:bg-gray-100 border border-transparent hover:border-gray-200";
    }
  };

  return (
    <button
      {...props}
      className={`
        cursor-pointer
        flex items-center justify-center
        w-12 h-12
        rounded-full
        font-medium
        transition-all
        hover:opacity-90
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${getVariantStyles()}
        ${className}
      `}
    >
      <Icon size={20} className="transition-transform" />
    </button>
  );
}
