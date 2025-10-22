'use client';

import { Search as SearchIcon, Store } from "lucide-react";
import UserMenu from "@/app/components/user/userMenu";
import IconOnlyButton from "@/app/components/buttons/iconOnlyButton";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";

interface NavbarProps {
  className?: string;
  title?: string;
}

export default function Navbar({ className = "", title = "Seller" }: NavbarProps) {
  const { user } = useAuth();
  const [sellerName, setSellerName] = useState<string>("");
  
  // Buscar nome do seller diretamente do banco
  useEffect(() => {
    const fetchSellerName = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/seller/profile/name?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setSellerName(data.name || user.name || "Usuário");
        } else {
          setSellerName(user.name || "Usuário");
        }
      } catch (error) {
        setSellerName(user.name || "Usuário");
      }
    };

    fetchSellerName();
  }, [user?.id, user?.name]);

  return (
    <nav className={`
      bg-[var(--surface)] border-b border-gray-200 px-4 py-3
      ${className}
    `}>
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Search */}
        <div className="flex items-center gap-6 flex-1">
          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <SearchIcon size={20} className="text-[var(--foreground)]" />
          </button>

          {/* Store Button */}
          <IconOnlyButton
            icon={Store}
            onClick={() => {
              // Navegar para a lojinha do usuário
              window.open('https://minhaloja.ckeet.com', '_blank');
            }}
            variant="surface"
            title="Visualizar minha loja"
          />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}