'use client';

import { useState } from 'react';
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
import DatePicker from '@/app/components/selectors/datePicker';

export default function Dashboard() {
  // Estado para o datepicker
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1 mês atrás
    new Date() // Hoje
  ]);

  // Dados simulados para o gráfico (últimos 7 dias)
  const chartData = [
    { name: 'Segunda', faturamento: 45200, usuarios: 1250, vendas: 320 },
    { name: 'Terça', faturamento: 38800, usuarios: 1180, vendas: 280 },
    { name: 'Quarta', faturamento: 51100, usuarios: 1420, vendas: 380 },
    { name: 'Quinta', faturamento: 47700, usuarios: 1350, vendas: 340 },
    { name: 'Sexta', faturamento: 62200, usuarios: 1580, vendas: 450 },
    { name: 'Sábado', faturamento: 75500, usuarios: 1680, vendas: 520 },
    { name: 'Domingo', faturamento: 58800, usuarios: 1520, vendas: 410 }
  ];

  // Dados dos cards - métricas essenciais
  const masterData = {
    faturamentoBruto: 1250000,
    faturamentoLiquido: 1125000,
    totalPagos: 15680,
    totalOrdens: 18450,
    lojasCadastradas: 1230,
    lojasBloqueadas: 45
  };

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

  return (
    <div className="space-y-6">
      {/* Cabeçalho com título e filtro de data */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        
        <div className="w-full md:w-72">
          <DatePicker
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={setDateRange}
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
          change={15}
          changeType="increase"
        />
        
        <ValueCard
          title="Líquido"
          value={masterData.faturamentoLiquido}
          currency="BRL"
          icon={TrendingUp}
          change={12}
          changeType="increase"
          background="secondary"
        />
        
        <NumberCard
          title="Pagos"
          value={masterData.totalPagos}
          icon={CheckCircle}
          change={8}
          changeType="increase"
        />
        
        <NumberCard
          title="Ordens"
          value={masterData.totalOrdens}
          icon={Package}
          change={5}
          changeType="increase"
          background="transparent"
        />
      </div>

      {/* Cards de lojas - Segunda linha */}
      
     
      {/* Gráfico de evolução */}
      <div className="mt-8">
        <AreaChartCard
          title="Detalhes do Faturamento Liquido"
          data={chartData}
          dataKeys={dataKeys}
          className="h-96"
        />
      </div>
    </div>
  );
}   