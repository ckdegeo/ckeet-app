'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Globe } from "lucide-react";
import Button from "../buttons/button";
import Input from "../inputs/input";
import { getAccessToken } from "@/lib/utils/authUtils";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toastUtils";

interface DomainConfig {
  subdomain: string;
}

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: DomainConfig) => Promise<boolean> | void;
  initialConfig?: DomainConfig;
  className?: string;
  isLoading?: boolean;
  required?: boolean; // Se true, modal não pode ser fechado até domínio ser criado
}

export default function DomainModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialConfig = {
    subdomain: ''
  },
  className = "",
  isLoading = false,
  required = false
}: DomainModalProps) {
  const [mounted, setMounted] = useState(false);
  const [domainConfig, setDomainConfig] = useState<DomainConfig>(initialConfig);
  const [internalLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDomainConfig(initialConfig);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen || !mounted) return null;

  const handleInputChange = (field: keyof DomainConfig) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDomainConfig(prev => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? String(e.target.checked) : e.target.value
    }));
  };

  const handleSave = async () => {
    if (!domainConfig.subdomain) {
      showErrorToast('Subdomínio é obrigatório');
      return;
    }

    setInternalLoading(true);
    
    try {
      // Criar domínio no banco de dados via API
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch('/api/seller/store/domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          subdomain: domainConfig.subdomain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Erro ao criar domínio';
        showErrorToast(errorMessage);
        return; // Não fazer throw, apenas mostrar toast e retornar
      }

      showSuccessToast('Domínio criado com sucesso!');
      
      // Fechar modal automaticamente após sucesso
      onClose();
      
      // Recarregar a página para atualizar o estado
      window.location.reload();
      
    } catch (error) {
      console.error('Erro ao criar domínio:', error);
      showErrorToast(error instanceof Error ? error.message : 'Erro ao criar domínio');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleClose = () => {
    // Se for obrigatório, não permitir fechar manualmente
    if (required) {
      return;
    }
    onClose();
  };

  const loading = isLoading || internalLoading;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9999]"
        onClick={required ? undefined : handleClose}
      />
      
      {/* Modal */}
      <div className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000]
        w-[95%] max-w-2xl max-h-[90vh] bg-[var(--surface)] rounded-lg shadow-xl
        overflow-hidden
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--on-background)]">
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg md:text-xl font-semibold text-[var(--foreground)]">
              Configurações de domínio
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={required}
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

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="space-y-6">

            {/* Configurações de Domínio */}
            <div className="bg-[var(--background)] border border-[var(--on-background)] rounded-2xl p-6">              
              <div className="space-y-4">
                <Input
                  label="Subdomínio *"
                  placeholder="minhaloja"
                  value={domainConfig.subdomain}
                  onChange={handleInputChange('subdomain')}
                  disabled={loading}
                />
                <p className="text-sm text-[var(--on-background)]">
                  Sua loja ficará disponível em: <strong>{domainConfig.subdomain || 'minhaloja'}.ckeet.store</strong>
                </p>
                
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 md:p-6 border-t border-[var(--on-background)]">
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSave}
              disabled={loading || !domainConfig.subdomain}
              className="flex items-center gap-2"
            >
              <Globe size={18} />
              {loading ? 'Criando domínio...' : 'Criar domínio'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
