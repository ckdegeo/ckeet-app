'use client';

export default function IntegrationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabeçalho skeleton */}
      <div className="flex items-center justify-between">
        {/* Título skeleton */}
        <div className="h-8 w-40 bg-[var(--on-background)]/10 rounded-lg"></div>
      </div>

      {/* Cards de status skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-xl p-6 space-y-4">
          {/* Header do card */}
          <div className="flex items-center justify-between">
            {/* Título skeleton */}
            <div className="h-4 w-32 bg-[var(--on-background)]/10 rounded"></div>
            {/* Ícone skeleton */}
            <div className="w-10 h-10 bg-[var(--on-background)]/10 rounded-lg"></div>
          </div>
          
          {/* Valor skeleton */}
          <div className="h-8 w-16 bg-[var(--on-background)]/10 rounded"></div>
        </div>
      </div>

      {/* Divider skeleton */}
      <div className="h-px bg-[var(--on-background)]/10"></div>

      {/* Seção de integrações skeleton */}
      <div className="space-y-4">
        {/* Título da seção skeleton */}
        <div className="h-6 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
        
        {/* Grid de cards de integração skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-2xl p-6 space-y-4">
            {/* Header do card de integração skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Ícone skeleton */}
                <div className="w-12 h-12 bg-[var(--on-background)]/10 rounded-xl"></div>
                <div className="space-y-2">
                  {/* Nome skeleton */}
                  <div className="h-5 w-32 bg-[var(--on-background)]/10 rounded"></div>
                  {/* Descrição skeleton */}
                  <div className="h-4 w-64 bg-[var(--on-background)]/10 rounded"></div>
                </div>
              </div>
              {/* Badge de status skeleton */}
              <div className="h-6 w-20 bg-[var(--on-background)]/10 rounded-full"></div>
            </div>
            
            {/* Informações adicionais skeleton */}
            <div className="space-y-2 pt-4 border-t border-[var(--on-background)]/10">
              <div className="h-3 w-40 bg-[var(--on-background)]/10 rounded"></div>
              <div className="h-3 w-32 bg-[var(--on-background)]/10 rounded"></div>
            </div>
            
            {/* Botão de ação skeleton */}
            <div className="h-10 w-full bg-[var(--on-background)]/10 rounded-lg mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

