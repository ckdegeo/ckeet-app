'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import IconOnlyButton from "../buttons/iconOnlyButton";

interface Order {
  id: string;
  product: string;
  price: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  date: string;
  time: string;
  key: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  order 
}: OrderDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status: Order['status']) => {
    const statusMap = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return statusMap[status];
  };

  const formatPaymentMethod = (method: Order['paymentMethod']) => {
    const methodMap = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      transfer: 'Transferência'
    };
    return methodMap[method];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      cancelled: 'text-red-600',
      refunded: 'text-blue-600'
    };
    return colors[status];
  };

  if (!isOpen || !mounted || !order) return null;

  const modalContent = (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div 
          className="bg-[var(--surface)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--on-background)]/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--on-background)]/10">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Detalhes da Compra
            </h2>
            <IconOnlyButton
              icon={X}
              onClick={onClose}
            />
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--on-background)]">ID:</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{order.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[var(--on-background)]">Produto:</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{order.product}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[var(--on-background)]">Preço:</span>
                <span className="text-sm font-bold text-[var(--primary)]">{formatCurrency(order.price)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[var(--on-background)]">Pagamento:</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{formatPaymentMethod(order.paymentMethod)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[var(--on-background)]">Status:</span>
                <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>{formatStatus(order.status)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[var(--on-background)]">Data:</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{formatDateTime(order.date, order.time)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[var(--on-background)]">Chave:</span>
                <span className="text-xs font-mono text-[var(--foreground)] break-all">{order.key}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
