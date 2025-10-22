'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Globe } from "lucide-react";
import Button from "../buttons/button";
import Input from "../inputs/input";
import { DOMAIN_CONFIG } from "@/lib/config/domains";

interface DomainConfig {
  customDomain: string;
  subdomain: string;
  sslEnabled: boolean;
}

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: DomainConfig) => Promise<boolean> | void;
  initialConfig?: DomainConfig;
  className?: string;
  isLoading?: boolean;
}

export default function DomainModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialConfig = {
    customDomain: '',
    subdomain: '',
    sslEnabled: true
  },
  className = "",
  isLoading = false
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
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));
  };

  const handleSave = async () => {
    if (!domainConfig.subdomain) {
      return;
    }

    setInternalLoading(true);
    try {
      const result = onSave?.(domainConfig);
      
      // Se onSave retornar uma Promise, aguardar
      if (result instanceof Promise) {
        const success = await result;
        if (success) {
          onClose();
        }
      } else {
        onClose();
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const loading = isLoading || internalLoading;

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

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="space-y-6">
            {/* Alerta informativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Configure seu domínio para continuar.</strong> Este será o endereço da sua loja online.
              </p>
            </div>

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
                  Sua loja ficará disponível em: <strong>{domainConfig.subdomain || 'minhaloja'}{DOMAIN_CONFIG.STORE_SUBDOMAIN_SUFFIX}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Use apenas letras minúsculas, números e hífen. Exemplo: minha-loja
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Em breve: Migração para ckeet.store
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-[var(--on-background)]">
          <Button 
            onClick={handleSave}
            disabled={loading || !domainConfig.subdomain}
            className="flex items-center gap-2"
          >
            <Globe size={18} />
            {loading ? 'Salvando...' : 'Salvar e continuar'}
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
