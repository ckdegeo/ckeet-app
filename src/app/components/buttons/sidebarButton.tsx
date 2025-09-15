'use client';

import { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface SidebarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label?: string;
  className?: string;
  isActive?: boolean;
  collapsed?: boolean;
}

export default function SidebarButton({
  icon: Icon,
  label,
  className = "",
  isActive = false,
  collapsed = false,
  ...props
}: SidebarButtonProps) {
  return (
    <button
      {...props}
      className={`
        cursor-pointer 
        flex items-center
        w-full py-3 px-4
        rounded-full
        font-medium
        transition-all
        hover:opacity-90
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${isActive 
          ? "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-variant)]" 
          : "bg-[var(--surface)] text-[var(--on-surface)] hover:bg-gray-100 border border-transparent hover:border-gray-200"
        }
        ${className}
      `}
    >
      <div className="w-8 flex justify-center">
        <Icon size={20} />
      </div>
      
      {!collapsed && label && (
        <span className="ml-3 truncate">{label}</span>
      )}
    </button>
  );
}
