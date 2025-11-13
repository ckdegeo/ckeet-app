'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Package,
  RefreshCw
} from 'lucide-react';
import ValueCard from '@/app/components/cards/valueCard';
import NumberCard from '@/app/components/cards/numberCard';
import AreaChartCard from '@/app/components/cards/areaChart';
import Selector from '@/app/components/selectors/selector';
import { AuthGuard } from '@/lib/components/AuthGuard';
import toast from 'react-hot-toast';
import DashboardSkeleton from '@/app/components/dashboard/dashboardSkeleton';

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

type PeriodOption = 'today' | 'week' | 'month' | 'year' | 'all';

function DashboardContent() {
  const [period, setPeriod] = useState<PeriodOption>('month');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFetchingRef = useRef(false); // Prevenir múltiplas requisições simultâneas

  // Calcular range de datas baseado no período selecionado
  const getDateRange = (period: PeriodOption): [Date, Date] => {
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'all':
        startDate = new Date('1900-01-01');
        break;
    }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return [startDate, endDate];
  };

  const fetchDashboardData = React.useCallback(async (isRefresh = false) => {
    // Prevenir múltiplas requisições simultâneas
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    
    // Se for refresh (não é o carregamento inicial), mostrar indicador sutil
    if (isRefresh && dashboardData) {
      setIsRefreshing(true);
    } else if (!dashboardData) {
      // Se não tem dados ainda, é o carregamento inicial
      setIsInitialLoading(true);
    }

    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        toast.error('Por favor, faça login novamente');
        window.location.href = '/seller/auth/login';
        return;
      }

      const [startDate, endDate] = getDateRange(period);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const params = new URLSearchParams();
      params.append('startDate', startDateStr);
      params.append('endDate', endDateStr);
      // Adicionar timestamp para bypass de cache
      params.append('_t', Date.now().toString());

      const response = await fetch(`/api/seller/dashboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao carregar dados');
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (error) {
      // Só mostrar toast de erro se não for um refresh silencioso
      if (!isRefresh) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados da dashboard';
        toast.error(errorMessage);
      }
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [period, dashboardData]);

  useEffect(() => {
    // Carregamento inicial - não é refresh
    fetchDashboardData(false);
    
    // Refresh automático a cada 30 segundos (silencioso, sem mostrar loading completo)
    const interval = setInterval(() => {
      fetchDashboardData(true); // true = é um refresh
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  const dataKeys = [
    {
      key: 'faturamento',
      name: 'Faturamento Líquido',
      color: '#b1031d',
      type: 'area' as const
    }
  ];

  // Estado de loading inicial - mostrar skeleton apenas na primeira vez
  if (isInitialLoading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  // Se não tem dados
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <div className="w-full md:w-72">
            <Selector
              value={period}
              onChange={(value) => setPeriod(value as PeriodOption)}
              options={[
                { value: 'today', label: 'Hoje' },
                { value: 'week', label: 'Últimos 7 dias' },
                { value: 'month', label: 'Último mês' },
                { value: 'year', label: 'Último ano' },
                { value: 'all', label: 'Todo período' }
              ]}
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
    <div className="space-y-6 relative">
      {/* Indicador sutil de refresh (não bloqueia a UI) */}
      {isRefreshing && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-lg shadow-sm">
          <RefreshCw size={14} className="animate-spin text-[var(--primary)]" />
          <span className="text-xs text-[var(--foreground-secondary)]">Atualizando...</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <div className="w-full md:w-72">
          <Selector
            value={period}
            onChange={(value) => {
              setPeriod(value as PeriodOption);
              // Quando mudar o período, mostrar loading inicial novamente
              setIsInitialLoading(true);
            }}
            options={[
              { value: 'today', label: 'Hoje' },
              { value: 'week', label: 'Últimos 7 dias' },
              { value: 'month', label: 'Último mês' },
              { value: 'year', label: 'Último ano' },
              { value: 'all', label: 'Todo período' }
            ]}
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