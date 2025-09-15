'use client';

import { useState } from "react";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import Button from "../buttons/button";
import SettingsModal from "../modals/settingsModal";

interface UserMenuProps {
  className?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

export default function UserMenu({ 
  className = "",
  userName = "Admin",
  userEmail = "admin@void.com",
  userAvatar,
  onLogout
}: UserMenuProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    setShowSettingsModal(true);
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
        >
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
              <User size={16} className="text-[var(--on-primary)]" />
            </div>
          )}
          
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-[var(--foreground)]">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {/* User Dropdown */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center">
                    <User size={20} className="text-[var(--on-primary)]" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-[var(--foreground)]">{userName}</p>
                  <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
              </div>
            </div>
            
            <div className="p-2 space-y-1">
              <Button
                onClick={handleSettingsClick}
                className="w-full justify-start bg-[var(--surface)] text-[var(--on-surface)] hover:bg-gray-100 py-2"
              >
                <Settings size={16} />
                <span className="text-sm font-medium">Configurações</span>
              </Button>
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

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
}
