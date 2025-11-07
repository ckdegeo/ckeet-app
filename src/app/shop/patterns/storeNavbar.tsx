'use client';

import Link from "next/link";
import { User, Menu, Backpack, LogOut } from "lucide-react";
import Button from "@/app/components/buttons/button";
import IconOnlyButton from "@/app/components/buttons/iconOnlyButton";
import { useState } from "react";
import { useCustomerLogout } from "@/lib/hooks/useCustomerLogout";

interface StoreNavbarProps {
  store: {
    name: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    showStoreName?: boolean;
  };
  isAuthenticated?: boolean;
  userName?: string;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onProfileClick?: () => void;
  onLogoutClick?: () => void;
}

export default function StoreNavbar({
  store,
  isAuthenticated = false,
  userName,
  onLoginClick,
  onRegisterClick,
  onProfileClick,
  onLogoutClick,
}: StoreNavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { logout } = useCustomerLogout();

  const primaryColor = store.primaryColor || '#bd253c';
  const secondaryColor = store.secondaryColor || '#970b27';

  return (
    <nav 
      className="sticky top-0 z-50 border-b backdrop-blur-sm bg-opacity-95"
      style={{ 
        backgroundColor: primaryColor,
        borderBottomColor: primaryColor
      }}
    >
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome da Loja */}
          <Link href="/shop" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {store.logoUrl && (
              <div className="h-10 w-10 bg-white rounded-lg p-1.5 flex items-center justify-center">
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            {store.showStoreName !== false && (
              <span className="text-xl font-bold text-white hidden sm:block">
                {store.name}
              </span>
            )}
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              /* Usuário Autenticado - Avatar e Botão de Logout */
              <div className="flex items-center gap-3">
                {/* Avatar do Usuário */}
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white border"
                  style={{ 
                    backgroundColor: secondaryColor,
                    borderColor: secondaryColor
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <User size={18} className="text-white" />
                  </div>
                  <span className="font-light text-sm">{userName ? userName.split(' ')[0] : 'Usuário'}</span>
                </div>

                {/* Botão de Logout */}
                <IconOnlyButton
                  icon={LogOut}
                  onClick={logout}
                  variant="surface"
                  title="Sair"
                  className="text-white border"
                  style={{ 
                    backgroundColor: secondaryColor,
                    borderColor: secondaryColor
                  }}
                />
              </div>
            ) : (
              /* Usuário NÃO Autenticado - Botões de Login e Registro */
              <div className="flex items-center gap-2">
                <Button
                  onClick={onLoginClick}
                  variant="secondary"
                  className="px-5 py-2 text-sm bg-white/10 hover:bg-white/20 text-white border-2 border-white/20"
                >
                  Login
                </Button>
                <Button
                  onClick={onRegisterClick}
                  className="px-5 py-2 text-sm"
                  style={{ 
                    backgroundColor: secondaryColor,
                    color: 'white'
                  }}
                >
                  Criar conta
                </Button>
              </div>
            )}

            {/* Inventário (só aparece se autenticado) */}
            {isAuthenticated && (
              <div className="relative">
                <IconOnlyButton
                  icon={Backpack}
                  onClick={() => {
                    window.location.href = '/shop/orders';
                  }}
                  title="Pedidos"
                  className="text-white border"
                  style={{ 
                    backgroundColor: secondaryColor,
                    borderColor: secondaryColor
                  }}
                />
                {/* Badge de quantidade */}
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  0
                </span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Inventário Mobile (só aparece se autenticado) */}
            {isAuthenticated && (
              <div className="relative">
                <IconOnlyButton
                  icon={Backpack}
                  onClick={() => {
                    window.location.href = '/shop/orders';
                  }}
                  variant="surface"
                  title="Pedidos"
                  className="text-white border w-10 h-10"
                  style={{ 
                    backgroundColor: secondaryColor,
                    borderColor: secondaryColor
                  }}
                />
               <span 
                  className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  0
                </span>
              </div>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white flex items-center justify-center"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-white/10">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 px-4">
                {/* Avatar do Usuário Mobile - seguindo design desktop */}
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white border"
                  style={{ 
                    backgroundColor: secondaryColor,
                    borderColor: secondaryColor
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    <User size={18} className="text-white" />
                  </div>
                  <span className="font-light text-sm">{userName ? userName.split(' ')[0] : 'Usuário'}</span>
                </div>
                
                {/* Botão de Logout Mobile - seguindo design desktop */}
                <IconOnlyButton
                  icon={LogOut}
                  onClick={() => {
                    setShowMobileMenu(false);
                    logout();
                  }}
                  variant="surface"
                  title="Sair"
                  className="text-white border"
                  style={{ 
                    backgroundColor: secondaryColor,
                    borderColor: secondaryColor
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4">
                <Button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onLoginClick?.();
                  }}
                  variant="secondary"
                  className="px-5 py-2 text-sm bg-white/10 hover:bg-white/20 text-white border-2 border-white/20"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onRegisterClick?.();
                  }}
                  className="px-5 py-2 text-sm"
                  style={{ 
                    backgroundColor: secondaryColor,
                    color: 'white'
                  }}
                >
                  Criar conta
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

