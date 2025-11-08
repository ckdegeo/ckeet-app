'use client';

export default function StoreSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabeçalho skeleton */}
      <div className="flex justify-between items-center">
        {/* Título skeleton */}
        <div className="h-8 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
        
        {/* Botão salvar skeleton */}
        <div className="h-10 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
      </div>

      {/* Conteúdo obrigatório skeleton */}
      <div className="space-y-6">
        {/* Informações básicas skeleton */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-2xl p-6 space-y-4">
          {/* Título da seção skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-[var(--on-background)]/10 rounded"></div>
            <div className="h-6 w-40 bg-[var(--on-background)]/10 rounded-lg"></div>
          </div>
          
          {/* Inputs skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-[var(--on-background)]/10 rounded-lg"></div>
            <div className="h-20 bg-[var(--on-background)]/10 rounded-lg"></div>
          </div>
          
          {/* Switch skeleton */}
          <div className="p-4 border border-[var(--on-background)]/10 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 bg-[var(--on-background)]/10 rounded"></div>
                <div className="h-3 w-64 bg-[var(--on-background)]/10 rounded"></div>
              </div>
              <div className="w-12 h-6 bg-[var(--on-background)]/10 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Personalização de cores skeleton */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-2xl p-6 space-y-4">
          {/* Título da seção skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-[var(--on-background)]/10 rounded"></div>
            <div className="h-6 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
          </div>
          
          {/* Color pickers skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-[var(--on-background)]/10 rounded-lg"></div>
            <div className="h-20 bg-[var(--on-background)]/10 rounded-lg"></div>
          </div>
        </div>

        {/* Seção de imagens skeleton */}
        <div className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-2xl p-6">
          {/* Título da seção skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 bg-[var(--on-background)]/10 rounded"></div>
            <div className="h-6 w-24 bg-[var(--on-background)]/10 rounded-lg"></div>
          </div>
          
          {/* Grid de imagens skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="p-5 border border-[var(--on-background)]/10 rounded-xl bg-[var(--background)]/40 space-y-4"
              >
                {/* Título e descrição skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-[var(--on-background)]/10 rounded"></div>
                  <div className="h-3 w-48 bg-[var(--on-background)]/10 rounded"></div>
                </div>
                
                {/* Image upload skeleton */}
                <div className="w-full aspect-square bg-[var(--on-background)]/10 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-2xl overflow-hidden">
        {/* Tabs header skeleton */}
        <div className="p-4 border-b border-[var(--on-background)]/10">
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
            <div className="h-10 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
          </div>
        </div>
        
        {/* Tab content skeleton */}
        <div className="p-6 space-y-6">
          {/* Seções de configuração skeleton */}
          {[1, 2, 3, 4].map((sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-2xl p-6 space-y-4"
            >
              {/* Título da seção skeleton */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-[var(--on-background)]/10 rounded"></div>
                <div className="h-6 w-40 bg-[var(--on-background)]/10 rounded-lg"></div>
              </div>
              
              {/* Conteúdo da seção skeleton */}
              <div className="space-y-4">
                <div className="h-16 bg-[var(--on-background)]/10 rounded-lg"></div>
                <div className="p-4 border border-[var(--on-background)]/10 rounded-xl space-y-3">
                  <div className="h-4 w-full bg-[var(--on-background)]/10 rounded"></div>
                  <div className="h-4 w-3/4 bg-[var(--on-background)]/10 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

