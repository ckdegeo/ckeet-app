'use client';

export default function MasterDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabeçalho skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Título skeleton */}
        <div className="h-8 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
        
        {/* Selector skeleton */}
        <div className="h-10 w-full md:w-72 bg-[var(--on-background)]/10 rounded-lg"></div>
      </div>

      {/* Grid de cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-xl p-6 space-y-4"
          >
            {/* Header do card */}
            <div className="flex items-center justify-between">
              {/* Título skeleton */}
              <div className="h-4 w-16 bg-[var(--on-background)]/10 rounded"></div>
              {/* Ícone skeleton */}
              <div className="w-10 h-10 bg-[var(--on-background)]/10 rounded-lg"></div>
            </div>
            
            {/* Valor skeleton */}
            <div className="space-y-2">
              <div className="h-8 w-24 bg-[var(--on-background)]/10 rounded"></div>
              <div className="h-3 w-20 bg-[var(--on-background)]/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico skeleton */}
      <div className="mt-8 bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-xl p-6">
        {/* Título do gráfico skeleton */}
        <div className="h-6 w-40 bg-[var(--on-background)]/10 rounded-lg mb-6"></div>
        
        {/* Área do gráfico skeleton */}
        <div className="h-96 bg-[var(--on-background)]/5 rounded-lg"></div>
      </div>
    </div>
  );
}

