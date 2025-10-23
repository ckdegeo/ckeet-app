'use client';

import Link from "next/link";
import { ShoppingCart, User, Menu } from "lucide-react";
import Button from "@/app/components/buttons/button";
import { useState } from "react";

interface StoreNavbarProps {
  store: {
    name: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
  };
  isAuthenticated?: boolean;
  userName?: string;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onProfileClick?: () => void;
}

export default function StoreNavbar({
  store,
  isAuthenticated = false,
  userName,
  onLoginClick,
  onRegisterClick,
  onProfileClick,
}: StoreNavbarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const primaryColor = store.primaryColor || '#6200EE';
  const secondaryColor = store.secondaryColor || '#03DAC6';

  return (
    <nav 
      className="sticky top-0 z-50 border-b backdrop-blur-sm bg-opacity-95"
      style={{ 
        backgroundColor: primaryColor,
        borderBottomColor: secondaryColor
      }}
    >
      <div className="container mx-auto px-4">
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
            <span className="text-xl font-bold text-white hidden sm:block">
              {store.name}
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              /* Usuário Autenticado - Menu Dropdown */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <User size={18} className="text-gray-700" />
                  </div>
                  <span className="font-medium text-sm">{userName || 'Usuário'}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onProfileClick?.();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Lógica de logout
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      Meus Pedidos
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Lógica de logout
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                )}
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

            {/* Carrinho (placeholder para futuro) */}
            <button 
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              title="Carrinho"
            >
              <ShoppingCart size={22} />
              {/* Badge de quantidade */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Carrinho Mobile */}
            <button 
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              title="Carrinho"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold text-[10px]">
                0
              </span>
            </button>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-white/10">
            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onProfileClick?.();
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  Meu Perfil
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  Meus Pedidos
                </button>
                <hr className="my-2 border-white/10" />
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 text-red-300 transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onLoginClick?.();
                  }}
                  variant="secondary"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-2 border-white/20"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onRegisterClick?.();
                  }}
                  className="w-full"
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

