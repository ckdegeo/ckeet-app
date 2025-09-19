'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Globe, Settings } from "lucide-react";
import Button from "../buttons/button";
import Input from "../inputs/input";

interface DomainConfig {
  customDomain: string;
  subdomain: string;
  sslEnabled: boolean;
}

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: DomainConfig) => void;
  initialConfig?: DomainConfig;
  className?: string;
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
  className = "" 
}: DomainModalProps) {
  const [mounted, setMounted] = useState(false);
  const [domainConfig, setDomainConfig] = useState<DomainConfig>(initialConfig);

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

  const handleSave = () => {
    onSave?.(domainConfig);
    onClose();
  };

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
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--on-background)]">
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg md:text-xl font-semibold text-[var(--foreground)]">
              Configurações de Domínio
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
        <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Configurações de Domínio */}
              <div className="bg-[var(--background)] border border-[var(--on-background)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={20} className="text-[var(--primary)]" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Configurações de Domínio
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Subdomínio"
                    placeholder="minhaloja"
                    value={domainConfig.subdomain}
                    onChange={handleInputChange('subdomain')}
                  />
                  <p className="text-sm text-[var(--on-background)]">
                    Sua loja ficará disponível em: <strong>{domainConfig.subdomain || 'minhaloja'}.ckeet.com</strong>
                  </p>
                  
                  <Input
                    label="Domínio Personalizado (Opcional)"
                    placeholder="www.minhaloja.com"
                    value={domainConfig.customDomain}
                    onChange={handleInputChange('customDomain')}
                  />
                  <p className="text-sm text-[var(--on-background)]">
                    Configure um domínio próprio para sua loja
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Informações sobre SSL */}
              <div className="bg-[var(--background)] border border-[var(--on-background)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={20} className="text-[var(--primary)]" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Configurações Avançadas
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg border border-[var(--on-background)]">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">SSL Habilitado</p>
                      <p className="text-sm text-[var(--on-background)]">Certificado de segurança automático</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-[var(--secondary)] font-medium">Ativo</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[var(--secondary)]/10 rounded-lg border border-[var(--secondary)]">
                    <h4 className="font-medium text-[var(--foreground)] mb-2">Como configurar domínio personalizado:</h4>
                    <ol className="text-sm text-[var(--on-background)] space-y-1">
                      <li>1. Acesse o painel do seu provedor de domínio</li>
                      <li>2. Configure o DNS apontando para nossos servidores</li>
                      <li>3. Aguarde a propagação (até 24 horas)</li>
                      <li>4. Seu domínio estará ativo automaticamente</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-[var(--on-background)]">
          <Button 
            onClick={onClose}
            className="bg-transparent text-[var(--on-surface)] hover:bg-gray-100 border border-[var(--on-background)]"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Globe size={18} />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
