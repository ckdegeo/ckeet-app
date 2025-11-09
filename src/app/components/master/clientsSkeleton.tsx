'use client';

export default function MasterClientsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabeçalho skeleton */}
      <div className="flex flex-col gap-4">
        {/* Título skeleton */}
        <div className="h-8 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>

        {/* Cards de estatísticas skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2].map((index) => (
            <div
              key={index}
              className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-xl p-6 space-y-4"
            >
              {/* Header do card */}
              <div className="flex items-center justify-between">
                {/* Título skeleton */}
                <div className="h-4 w-24 bg-[var(--on-background)]/10 rounded"></div>
                {/* Ícone skeleton */}
                <div className="w-10 h-10 bg-[var(--on-background)]/10 rounded-lg"></div>
              </div>
              
              {/* Valor skeleton */}
              <div className="space-y-2">
                <div className="h-8 w-20 bg-[var(--on-background)]/10 rounded"></div>
                <div className="h-3 w-16 bg-[var(--on-background)]/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Filtros skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search skeleton */}
          <div className="h-10 w-full sm:w-[400px] bg-[var(--on-background)]/10 rounded-lg"></div>
        </div>
      </div>

      {/* Tabela skeleton */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-xl overflow-hidden">
        {/* Cabeçalho da tabela skeleton */}
        <div className="p-4 border-b border-[var(--on-background)]/10">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
              <div key={index} className="h-4 flex-1 bg-[var(--on-background)]/10 rounded"></div>
            ))}
          </div>
        </div>

        {/* Linhas da tabela skeleton */}
        <div className="divide-y divide-[var(--on-background)]/10">
          {[1, 2, 3, 4, 5, 6].map((rowIndex) => (
            <div key={rowIndex} className="p-4">
              <div className="flex gap-4 items-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((colIndex) => (
                  <div key={colIndex} className="h-4 flex-1 bg-[var(--on-background)]/10 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

