'use client';

import { useState } from 'react';
import { Wallet, CreditCard, Shield, PiggyBank, Plus, Edit, Trash2 } from 'lucide-react';
import ValueCard from '@/app/components/cards/valueCard';
import Button from '@/app/components/buttons/button';
import Table from '@/app/components/tables/table';

export default function Financial() {
  const [bankAccounts] = useState([
    {
      id: '1',
      bank: 'Banco do Brasil',
      accountType: 'Conta Corrente',
      accountNumber: '12345-6',
      agency: '1234',
      holder: 'João Silva',
      document: '123.456.789-00',
      pixKey: 'joao.silva@email.com',
      status: 'active'
    },
    {
      id: '2',
      bank: 'Itaú',
      accountType: 'Conta Poupança',
      accountNumber: '98765-4',
      agency: '5678',
      holder: 'João Silva',
      document: '123.456.789-00',
      pixKey: '(11) 99999-9999',
      status: 'pending'
    }
  ]);

  const handleAddBankAccount = () => {
    console.log('Abrir modal de cadastro de conta bancária');
  };

  const handleEditAccount = () => {
    console.log('Editar conta');
  };

  const handleDeleteAccount = () => {
    console.log('Excluir conta');
  };

  const bankAccountColumns = [
    {
      key: 'bank',
      label: 'Banco',
      width: 'w-[160px]'
    },
    {
      key: 'accountType',
      label: 'Tipo',
      width: 'w-[130px]'
    },
    {
      key: 'agency',
      label: 'Agência',
      width: 'w-[90px]'
    },
    {
      key: 'accountNumber',
      label: 'Conta',
      width: 'w-[110px]'
    },
    {
      key: 'holder',
      label: 'Titular',
      width: 'w-[150px]'
    },
    {
      key: 'pixKey',
      label: 'Chave PIX',
      width: 'w-[180px]'
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-[100px]',
      render: (value: unknown) => {
        const status = value as string;
        const statusMap: { [key: string]: string } = {
          active: 'Ativa',
          pending: 'Pendente',
          blocked: 'Bloqueada'
        };
        return statusMap[status] || status;
      }
    }
  ];

  const bankAccountActions = [
    {
      icon: Edit,
      label: 'Editar conta',
      onClick: handleEditAccount,
      color: 'primary'
    },
    {
      icon: Trash2,
      label: 'Excluir conta',
      onClick: handleDeleteAccount,
      color: 'error'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Financeiro
          </h1>
        </div>
      </div>

      {/* Cards de Valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ValueCard
          title="Valor a Sacar"
          value={15420.50}
          currency="BRL"
          icon={Wallet}
          change={12.5}
          changeType="increase"
        />
        
        <ValueCard
          title="Valor de Retenção"
          value={2840.30}
          currency="BRL"
          icon={Shield}
          background="secondary"
        />
        
        <ValueCard
          title="Reserva Financeira"
          value={8750.00}
          currency="BRL"
          icon={PiggyBank}
          change={5.2}
          changeType="increase"
        />
        
        <ValueCard
          title="Total em Conta"
          value={27010.80}
          currency="BRL"
          icon={CreditCard}
          change={8.7}
          changeType="increase"
        />
      </div>

      {/* Seção de Contas Bancárias */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Contas Bancárias
            </h2>
          </div>
          <Button
            variant="primary"
            onClick={handleAddBankAccount}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Cadastrar Conta
          </Button>
        </div>

        <Table
          data={bankAccounts}
          // @ts-expect-error - Tipagem específica do componente Table
          columns={bankAccountColumns}
          actions={bankAccountActions}
          emptyMessage="Nenhuma conta bancária cadastrada"
        />
      </div>
    </div>
  );
}