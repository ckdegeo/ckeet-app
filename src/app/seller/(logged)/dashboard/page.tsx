'use client';

import { useState } from 'react';
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

export default function Dashboard() {
  // Estado para o datepicker
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1 mês atrás
    new Date() // Hoje
  ]);

  // Dados simulados para o gráfico (últimos 7 dias)
  const chartData = [
    { name: 'Segunda', faturamento: 4200 },
    { name: 'Terça', faturamento: 3800 },
    { name: 'Quarta', faturamento: 5100 },
    { name: 'Quinta', faturamento: 4700 },
    { name: 'Sexta', faturamento: 6200 },
    { name: 'Sábado', faturamento: 7500 },
    { name: 'Domingo', faturamento: 5800 }
  ];

  // Dados dos cards
  const dashboardData = {
    faturamentoBruto: 37300,
    faturamentoLiquido: 32100,
    qtdVendas: 215,
    ordens: {
      total: 243,
      pendentes: 28,
      aprovadas: 215
    }
  };

  // Configuração do gráfico
  const dataKeys = [
    {
      key: 'faturamento',
      name: 'Faturamento Líquido',
      color: '#b1031d',
      type: 'area' as const
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

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ValueCard
          title="Faturamento Bruto"
          value={dashboardData.faturamentoBruto}
          currency="BRL"
          icon={DollarSign}
          change={12}
          changeType="increase"
        />
        
        <ValueCard
          title="Faturamento Líquido"
          value={dashboardData.faturamentoLiquido}
          currency="BRL"
          icon={TrendingUp}
          change={8}
          changeType="increase"
          background="transparent"
        />
        
        <NumberCard
          title="Quantidade de Vendas"
          value={dashboardData.qtdVendas}
          icon={ShoppingCart}
          change={5}
          changeType="increase"
        />
        
        <NumberCard
          title="Total de Ordens"
          value={dashboardData.ordens.total}
          icon={Package}
          change={3}
          changeType="increase"
          background="transparent"
        />
      </div>
     
      {/* Gráfico de faturamento */}
      <div className="mt-8">
        <AreaChartCard
          title="Evolução do Faturamento Líquido"
          data={chartData}
          dataKeys={dataKeys}
          className="h-96"
        />
      </div>
    </div>
  );
}