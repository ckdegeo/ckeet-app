'use client';

import { useEffect, useRef } from "react";
import { LogOut } from "lucide-react";
import Button from "../buttons/button";
import { useLogout } from "@/lib/hooks/useLogout";

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function UserDropdown({ 
  isOpen, 
  onClose, 
  onLogout 
}: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useLogout();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      // Executar logout usando o hook
      await logout();
      
      // Chamar callback se fornecido
      if (onLogout) {
        onLogout();
      }
      
      // Fechar dropdown
      onClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-48 bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--on-background)]/10 z-[9999]"
    >
      <div className="p-3">
        <Button
          onClick={handleLogout}
          className="w-full bg-[var(--error)] hover:bg-[var(--error)]/90 flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  );
}