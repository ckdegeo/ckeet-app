'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Shield } from "lucide-react";
import Button from "../buttons/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { showSuccessToast, showErrorToast } from '@/lib/utils/toastUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  className = "" 
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para troca de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  const { user, refresh } = useAuth();

  // Carregar dados do usuário quando o modal abrir
  useEffect(() => {
    const fetchSellerName = async () => {
      if (!isOpen || !user?.id) return;
      
      try {
        const response = await fetch(`/api/seller/profile/name?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setName(data.name || user.name || "");
        } else {
          setName(user.name || "");
        }
      } catch (error) {
        setName(user.name || "");
      }
    };

    fetchSellerName();
  }, [isOpen, user?.id, user?.name]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    if (activeTab === "profile") {
      await handleSaveProfile();
    } else if (activeTab === "security") {
      await handleChangePassword();
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Fazer chamada para a API para atualizar o nome
      const response = await fetch('/api/seller/profile/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao atualizar o nome.');
      }

      showSuccessToast(result.message || 'Nome atualizado com sucesso!');
      
      // Fechar modal após salvar
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao atualizar o nome');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setIsPasswordLoading(true);
    try {
      const response = await fetch('/api/seller/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao alterar senha.');
      }

      showSuccessToast(result.message || 'Senha alterada com sucesso!');
      
      // Limpar campos de senha
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Fechar modal após salvar
      onClose();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao alterar senha');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "security", label: "Segurança", icon: Shield }
  ];

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9999]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000]
        w-[95%] max-w-4xl max-h-[90vh] bg-[var(--surface)] rounded-lg shadow-xl
        overflow-hidden
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-[var(--foreground)]">
            Configurações
          </h2>
          <button
            onClick={onClose}
            className="
              cursor-pointer
              flex items-center justify-center
              w-8 h-8 md:w-10 md:h-10
              rounded-full
              bg-[var(--primary)]
              text-[var(--on-primary)]
              font-medium
              transition-all
              hover:opacity-90
              hover:bg-[var(--primary-variant)]
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <X size={18} className="md:hidden" />
            <X size={20} className="hidden md:block" />
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden w-full overflow-x-auto border-b border-gray-200">
          <div className="flex w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 min-w-[100px] py-3 px-2
                    flex flex-col items-center justify-center gap-1
                    border-b-2 transition-all
                    ${activeTab === tab.id 
                      ? "border-[var(--primary)] text-[var(--primary)]" 
                      : "border-transparent text-gray-500"}
                  `}
                >
                  <Icon size={18} />
                  <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[65vh] md:h-[500px]">
          {/* Sidebar - Desktop Only */}
          <div className="hidden md:block md:w-64 md:border-r border-gray-200">
            <nav className="p-4 flex flex-col gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full justify-start whitespace-nowrap
                      px-0
                      rounded-full
                      ${activeTab === tab.id 
                        ? "bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-variant)]" 
                        : "bg-transparent text-[var(--on-surface)] hover:bg-gray-100 border border-transparent hover:border-gray-200"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="text-base md:text-lg font-semibold text-[var(--foreground)]">
                  Perfil
                </h3>

                <hr className="border-gray-200 my-4" />	
                
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium text-[var(--foreground)]">
                      Nome
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="
                        w-full
                        px-3 py-2 md:px-4 md:py-3
                        rounded-full
                        bg-transparent
                        border border-[var(--on-background)]
                        text-[var(--foreground)]
                        placeholder:text-[var(--on-background)]
                        transition-all
                        outline-none
                        focus:border-[var(--primary)]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium text-[var(--foreground)]">
                      E-mail
                    </label>
                    <input 
                      type="email" 
                      value={user?.email || ""}
                      disabled
                      className="
                        w-full
                        px-3 py-2 md:px-4 md:py-3
                        rounded-full
                        bg-transparent
                        border border-[var(--on-background)]
                        text-[var(--foreground)]
                        placeholder:text-[var(--on-background)]
                        transition-all
                        outline-none
                        focus:border-[var(--primary)]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium text-[var(--foreground)]">
                      Cargo
                    </label>
                    <input 
                      type="text" 
                      value="Seller"
                      disabled
                      className="
                        w-full
                        px-3 py-2 md:px-4 md:py-3
                        rounded-full
                        bg-transparent
                        border border-[var(--on-background)]
                        text-[var(--foreground)]
                        placeholder:text-[var(--on-background)]
                        transition-all
                        outline-none
                        focus:border-[var(--primary)]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    />
                  </div>
                </div>
              </div>
            )}


            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Segurança
                </h3>
                <hr className="border-gray-200 my-4" />

                <div className="space-y-6">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium text-[var(--foreground)]">
                      Senha atual
                    </label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      disabled={isPasswordLoading}
                      className="
                        w-full
                        px-3 py-2 md:px-4 md:py-3
                        rounded-full
                        bg-transparent
                        border border-[var(--on-background)]
                        text-[var(--foreground)]
                        placeholder:text-[var(--on-background)]
                        transition-all
                        outline-none
                        focus:border-[var(--primary)]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium text-[var(--foreground)]">
                      Nova senha
                    </label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                      disabled={isPasswordLoading}
                      className="
                        w-full
                        px-3 py-2 md:px-4 md:py-3
                        rounded-full
                        bg-transparent
                        border border-[var(--on-background)]
                        text-[var(--foreground)]
                        placeholder:text-[var(--on-background)]
                        transition-all
                        outline-none
                        focus:border-[var(--primary)]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-medium text-[var(--foreground)]">
                      Confirmar nova senha
                    </label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      disabled={isPasswordLoading}
                      className="
                        w-full
                        px-3 py-2 md:px-4 md:py-3
                        rounded-full
                        bg-transparent
                        border border-[var(--on-background)]
                        text-[var(--foreground)]
                        placeholder:text-[var(--on-background)]
                        transition-all
                        outline-none
                        focus:border-[var(--primary)]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-200">
          <Button 
            onClick={handleSave}
            disabled={isLoading || isPasswordLoading}
            className="text-sm md:text-base"
          >
            {isLoading ? 'Salvando...' : isPasswordLoading ? 'Alterando senha...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
