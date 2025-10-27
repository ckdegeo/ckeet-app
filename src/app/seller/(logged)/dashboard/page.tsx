'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Package
} from 'lucide-react';
import ValueCard from '@/app/components/cards/valueCard';
import NumberCard from '@/app/components/cards/numberCard';
import AreaChartCard from '@/app/components/cards/areaChart';
import DatePicker from '@/app/components/selectors/datePicker';
import { AuthGuard } from '@/lib/components/AuthGuard';
import toast from 'react-hot-toast';

interface DashboardData {
  faturamentoBruto: number;
  faturamentoLiquido: number;
  qtdVendas: number;
  ordens: {
    total: number;
    pendentes: number;
    aprovadas: number;
  };
  chart: Array<{ name: string; faturamento: number }>;
  change: number;
}

function DashboardContent() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
  ]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.warn('Token não encontrado no localStorage');
        setIsLoading(false);
        return;
      }

      const startDate = dateRange[0]?.toISOString().split('T')[0];
      const endDate = dateRange[1]?.toISOString().split('T')[0];
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/seller/dashboard?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao carregar dados');
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados da dashboard';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const dataKeys = [
    {
      key: 'faturamento',
      name: 'Faturamento Líquido',
      color: '#b1031d',
      type: 'area' as const
    }
  ];

  // Estado de loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <div className="w-full md:w-72">
            <DatePicker
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={setDateRange}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
        </div>
      </div>
    );
  }

  // Se não tem dados
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <div className="w-full md:w-72">
            <DatePicker
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={setDateRange}
            />
          </div>
        </div>
        
        <div className="text-center py-12 text-[var(--foreground-secondary)]">
          Nenhum dado disponível para o período selecionado
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <div className="w-full md:w-72">
          <DatePicker
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={setDateRange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ValueCard
          title="Bruto"
          value={dashboardData.faturamentoBruto}
          currency="BRL"
          icon={DollarSign}
          change={dashboardData.change}
          changeType={dashboardData.change >= 0 ? "increase" : "decrease"}
        />
        
        <ValueCard
          title="Líquido"
          value={dashboardData.faturamentoLiquido}
          currency="BRL"
          icon={TrendingUp}
          change={dashboardData.change}
          changeType={dashboardData.change >= 0 ? "increase" : "decrease"}
          background="transparent"
        />
        
        <NumberCard
          title="Qtd. Vendas"
          value={dashboardData.qtdVendas}
          icon={ShoppingCart}
          change={0}
          changeType="increase"
        />
        
        <NumberCard
          title="Ordens"
          value={dashboardData.ordens.total}
          icon={Package}
          change={0}
          changeType="increase"
          background="transparent"
        />
      </div>
     
      <div className="mt-8">
        <AreaChartCard
          title="Total líquido"
          data={dashboardData.chart.length > 0 ? dashboardData.chart : [{ name: 'Sem dados', faturamento: 0 }]}
          dataKeys={dataKeys}
          className="h-96"
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}