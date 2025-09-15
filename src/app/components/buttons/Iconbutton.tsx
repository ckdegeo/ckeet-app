'use client';

import { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon: LucideIcon;
  className?: string;
  iconPosition?: "left" | "right";
}

export default function IconButton({
  children,
  icon: Icon,
  className = "",
  iconPosition = "left",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={`
        cursor-pointer 
        flex items-center justify-center gap-2
        px-6 py-3
        rounded-full
        bg-[var(--primary)]
        text-[var(--on-primary)]
        font-medium
        transition-all
        hover:opacity-90
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {iconPosition === "left" && <Icon size={20} />}
      {children}
      {iconPosition === "right" && <Icon size={20} />}
    </button>
  );
}