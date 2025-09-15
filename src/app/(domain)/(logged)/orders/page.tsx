'use client';

import { useState } from 'react';
import Table from '@/app/components/tables/table';
import DatePicker from '@/app/components/selectors/datePicker';
import OrderDetailsModal from '@/app/components/modals/orderDetailsModal';
import ReportConfirmationModal from '@/app/components/modals/reportConfirmationModal';

import { Eye, Download, Flag } from 'lucide-react';

// Dados de exemplo
const sampleOrders = [
  {
    id: 'ORD001',
    product: 'Smartphone XYZ',
    price: 1299.90,
    paymentMethod: 'credit_card',
    status: 'completed',
    date: '2024-01-15',
    time: '14:30',
    key: 'ABCD-1234-EFGH-5678'
  },
  {
    id: 'ORD002',
    product: 'Fone de Ouvido Bluetooth',
    price: 199.90,
    paymentMethod: 'pix',
    status: 'completed',
    date: '2024-01-14',
    time: '16:45',
    key: 'WXYZ-9876-QRST-5432'
  },
  {
    id: 'ORD003',
    product: 'Smartwatch',
    price: 499.90,
    paymentMethod: 'debit_card',
    status: 'pending',
    date: '2024-01-13',
    time: '10:15',
    key: 'MNOP-1111-VWXY-2222'
  },
  {
    id: 'ORD004',
    product: 'Camiseta Básica',
    price: 49.90,
    paymentMethod: 'boleto',
    status: 'cancelled',
    date: '2024-01-12',
    time: '09:20',
    key: 'DEFG-3333-HIJK-4444'
  },
  {
    id: 'ORD005',
    product: 'Calça Jeans',
    price: 129.90,
    paymentMethod: 'credit_card',
    status: 'refunded',
    date: '2024-01-11',
    time: '18:30',
    key: 'LMNO-5555-PQRS-6666'
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(sampleOrders);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Estados dos modais
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);


  // Função para formatar data e hora
  const formatDateTime = (date, time) => {
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para formatar status
  const formatStatus = (status) => {
    const statusMap = {
      completed: 'Concluído',
      pending: 'Pendente',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return statusMap[status];
  };

  // Função para formatar forma de pagamento
  const formatPaymentMethod = (method) => {
    const methodMap = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      transfer: 'Transferência'
    };
    return methodMap[method];
  };

  // Função para formatar valor
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Handlers para ações
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  const handleDownloadKey = (order) => {
    // Implementar download direto da chave
    const dataStr = `Chave do produto: ${order.key}\nProduto: ${order.product}\nData: ${formatDateTime(order.date, order.time)}`;
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chave-${order.product.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReportOrder = (order) => {
    setSelectedOrder(order);
    setIsReportModalOpen(true);
  };

  const handleReportConfirm = (reason) => {
    console.log('Denúncia enviada:', { order: selectedOrder, reason });
    alert(`Denúncia da ordem ${selectedOrder?.id} registrada com sucesso!`);
  };



  // Função para filtrar ordens por data
  const filteredOrders = orders.filter(order => {
    if (!startDate || !endDate) return true;
    
    const orderDate = new Date(order.date + 'T' + order.time);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Handler para mudança de data
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // Configuração das colunas
  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: 'w-[100px]'
    },
    {
      key: 'product',
      label: 'Produto',
      width: 'w-[200px]'
    },
    {
      key: 'price',
      label: 'Preço',
      width: 'w-[120px]',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'paymentMethod',
      label: 'Pagamento',
      width: 'w-[140px]',
      render: (value) => formatPaymentMethod(value)
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-[120px]',
      render: (value) => formatStatus(value)
    },
    {
      key: 'date',
      label: 'Data e Hora',
      width: 'w-[140px]',
      render: (value) => {
        const order = orders.find(o => o.date === value);
        return order ? formatDateTime(order.date, order.time) : String(value);
      }
    },
    {
      key: 'key',
      label: 'Chave',
      width: 'w-[180px]',
      render: (value) => {
        const key = String(value);
        return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
      }
    }
  ];

  // Configuração das ações
  const actions = [
    {
      icon: Eye,
      label: 'Ver detalhes da ordem',
      onClick: handleViewOrder,
      color: 'primary'
    },
    {
      icon: Download,
      label: 'Download da chave',
      onClick: handleDownloadKey,
      color: 'secondary',
      show: (order) => order.status === 'completed'
    },
    {
      icon: Flag,
      label: 'Reclamar',
      onClick: handleReportOrder,
      color: 'error'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Cabeçalho com DatePicker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Minhas Compras
        </h1>
        <div className="w-full sm:w-80">
          <DatePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />
        </div>
      </div>

      {/* Tabela de ordens */}
      <Table
        data={filteredOrders}
        columns={columns}
        actions={actions}
        itemsPerPage={10}
        emptyMessage="Nenhuma compra encontrada no período selecionado"
      />

      {/* Modais */}
      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={() => setIsOrderDetailsModalOpen(false)}
        order={selectedOrder}
      />

      <ReportConfirmationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        order={selectedOrder}
        onConfirm={handleReportConfirm}
      />

      
    </div>
  );
}