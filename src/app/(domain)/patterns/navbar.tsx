'use client';

import { Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import IconOnlyButton from "@/app/components/buttons/iconOnlyButton";
import SearchInput from "@/app/components/inputs/search";
import UserDropdown from "@/app/components/modals/userDropdown";

interface NavbarProps {
  logoUrl?: string;
  className?: string;
}

export default function Navbar({ 
  logoUrl = "/logo.png",
  className = "" 
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/shop');
  };

  const handleCartClick = () => {
    router.push('/orders');
  };

  const handleUserClick = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleLogout = () => {
    // Implementar lógica de logout
    console.log('Fazendo logout...');
    router.push('/auth/login');
  };

  return (
    <nav className={`
      bg-[var(--background)] border-b border-[var(--on-background)]/20 px-4 py-4
      ${className}
    `}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo/Brand */}
          <div className="flex items-center">
            {/* Logo/Brand */}
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
              <img 
                src={logoUrl} 
                alt="Logo"
                className="h-10 w-auto max-w-[140px] object-contain"
              />
            </div>
          </div>

          {/* Center Section - Search (Desktop) */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchInput 
              placeholder="Buscar produtos..."
              className="w-full"
            />
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2 relative">
            {/* Mobile Search Button */}
            <IconOnlyButton
              icon={Search}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              variant="surface"
              className="md:hidden"
            />

            {/* Cart */}
            <IconOnlyButton
              icon={ShoppingCart}
              onClick={handleCartClick}
              variant="surface"
              className="relative"
            />

            {/* User Account */}
            <div className="relative">
              <IconOnlyButton
                icon={User}
                onClick={handleUserClick}
                variant="surface"
              />
              <UserDropdown
                isOpen={isUserDropdownOpen}
                onClose={() => setIsUserDropdownOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>

        {/* Mobile Search (Expandable) */}
        {isSearchOpen && (
          <div className="md:hidden mt-3 pb-3">
            <SearchInput 
              placeholder="Buscar produtos..."
              className="w-full"
            />
          </div>
        )}
      </div>


    </nav>
  );
}