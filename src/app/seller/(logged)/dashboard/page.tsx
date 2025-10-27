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
import Selector from '@/app/components/selectors/selector';
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

type PeriodOption = 'today' | 'week' | 'month' | 'year' | 'all';

function DashboardContent() {
  const [period, setPeriod] = useState<PeriodOption>('month');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('🎫 [Dashboard Frontend] Token encontrado:', accessToken ? 'Sim' : 'Não');
      console.log('👤 [Dashboard Frontend] User data:', userData ? JSON.parse(userData) : 'Não encontrado');
      
      if (!accessToken) {
        console.warn('❌ [Dashboard Frontend] Token não encontrado no localStorage');
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
      console.log('📦 [Dashboard Frontend] Dados recebidos da API:', result.data);
      console.log('📦 [Dashboard Frontend] Ordens recebidas:', result.data.ordens);
      setDashboardData(result.data);
      console.log('✅ [Dashboard Frontend] Estado atualizado com:', result.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados da dashboard';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    // Limpar qualquer cache antigo ao montar o componente
    console.log('🔄 [Dashboard] Componente montado - limpando cache se necessário');
    
    fetchDashboardData();
    
    // Refresh automático a cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 [Dashboard] Refresh automático acionado');
      fetchDashboardData();
    }, 30000);

    return () => {
      console.log('🧹 [Dashboard] Limpando intervalo de refresh');
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

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