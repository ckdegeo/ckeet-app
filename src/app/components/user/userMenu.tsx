'use client';

import { useState, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import Button from "../buttons/button";
import SettingsModal from "../modals/settingsModal";
import { useLogout } from "@/lib/hooks/useLogout";
import { useAuth } from "@/lib/hooks/useAuth";

interface UserMenuProps {
  className?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

export default function UserMenu({ 
  className = "",
  userName,
  userEmail,
  userAvatar,
  onLogout
}: UserMenuProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sellerName, setSellerName] = useState<string>("");
  const { logout } = useLogout();
  const { user } = useAuth();

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

  // Usar dados do usuário logado ou fallback para props
  const displayName = sellerName || user?.name || userName || "Usuário";
  const displayEmail = user?.email || userEmail || "usuario@exemplo.com";
  const displayAvatar = userAvatar;

  // Verificar se é master (não precisa de configurações)
  const isMaster = user?.user_type === 'master';

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    setShowSettingsModal(true);
  };

  const handleLogoutClick = async () => {
    try {
      // Executar logout usando o hook
      await logout();

      // Chamar callback se fornecido
      if (onLogout) {
        onLogout();
      }

      // Fechar menu
      setShowUserMenu(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
        >
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
              <User size={16} className="text-[var(--on-primary)]" />
            </div>
          )}

          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-[var(--foreground)]">{displayName}</p>
            <p className="text-xs text-gray-500">{displayEmail}</p>
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {/* User Dropdown */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] border border-gray-200 rounded-lg shadow-lg z-50">

            <div className="p-2 space-y-1">
              {/* Não mostrar Configurações para master */}
              {!isMaster && (
                <Button
                  onClick={handleSettingsClick}
                  className="w-full justify-start bg-[var(--surface)] text-[var(--on-surface)] hover:bg-gray-100 py-2"
                >
                  <Settings size={16} />
                  <span className="text-sm font-medium">Configurações</span>
                </Button>
              )}
              <Button
                onClick={handleLogoutClick}
                className="w-full justify-start bg-[var(--error)] text-[var(--on-error)] py-2"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Sair</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Click Outside Handler */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Settings Modal - Apenas para não-masters */}
      {!isMaster && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  );
}
