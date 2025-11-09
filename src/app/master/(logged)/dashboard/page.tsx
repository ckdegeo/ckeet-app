'use client';

import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Package,
  Store,
  ShieldX
} from 'lucide-react';
import ValueCard from '@/app/components/cards/valueCard';
import NumberCard from '@/app/components/cards/numberCard';
import AreaChartCard from '@/app/components/cards/areaChart';
import Selector from '@/app/components/selectors/selector';
import { getAccessToken } from '@/lib/utils/authUtils';
import MasterDashboardSkeleton from '@/app/components/master/dashboardSkeleton';

export default function Dashboard() {
  // Período (Selector)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

  // Estado de métricas
  const [masterData, setMasterData] = useState({
    faturamentoBruto: 0,
    faturamentoLiquido: 0,
    totalPagos: 0,
    totalOrdens: 0,
  });

  // Gráfico
  const [chartData, setChartData] = useState<{ name: string; faturamento: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const token = getAccessToken();
        const res = await fetch(`/api/master/dashboard?period=${period}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        const json = await res.json();
        if (res.ok && json?.data) {
          setMasterData({
            faturamentoBruto: json.data.faturamentoBruto || 0,
            faturamentoLiquido: json.data.faturamentoLiquido || 0,
            totalPagos: json.data.totalPagos || 0,
            totalOrdens: json.data.totalOrdens || 0,
          });
          setChartData(json.data.chart || []);
        }
      } catch (e) {
        console.error('Erro ao carregar dashboard master:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [period]);

  // Configuração do gráfico
  const dataKeys = [
    {
      key: 'faturamento',
      name: 'Faturamento Total',
      color: '#bd253c',
      type: 'area' as const
    },
    {
      key: 'usuarios',
      name: 'Usuários Ativos',
      color: '#970b27',
      type: 'line' as const
    }
  ];

  if (isLoading) {
    return <MasterDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com título e filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        
        <div className="w-full md:w-72">
          <Selector
            value={period}
            onChange={(v) => setPeriod(v as '7d' | '30d' | '90d' | '12m')}
            options={[
              { value: '7d', label: 'Últimos 7 dias' },
              { value: '30d', label: 'Últimos 30 dias' },
              { value: '90d', label: 'Últimos 90 dias' },
              { value: '12m', label: 'Últimos 12 meses' },
            ]}
          />
        </div>
      </div>

      {/* Cards essenciais - Primeira linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ValueCard
          title="Bruto"
          value={masterData.faturamentoBruto}
          currency="BRL"
          icon={DollarSign}
          change={0}
          changeType="increase"
        />
        
        <ValueCard
          title="Líquido"
          value={masterData.faturamentoLiquido}
          currency="BRL"
          icon={TrendingUp}
          change={0}
          changeType="increase"
          background="secondary"
        />
        
        <NumberCard
          title="Pagos"
          value={masterData.totalPagos}
          icon={CheckCircle}
          change={0}
          changeType="increase"
        />
        
        <NumberCard
          title="Ordens"
          value={masterData.totalOrdens}
          icon={Package}
          change={0}
          changeType="increase"
          background="transparent"
        />
      </div>

      {/* Cards de lojas - Segunda linha */}
      
     
      {/* Gráfico de evolução */}
      <div className="mt-8">
        <AreaChartCard
          title="Projeção do líquido (Plataforma)"
          data={chartData}
          dataKeys={dataKeys}
          className="h-96"
        />
      </div>
    </div>
  );
}   