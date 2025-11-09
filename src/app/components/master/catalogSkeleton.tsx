'use client';

export default function MasterCatalogSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabeçalho skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Título skeleton */}
        <div className="h-8 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
        
        {/* Botões skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-[var(--on-background)]/10 rounded-lg"></div>
          <div className="h-10 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
        </div>
      </div>

      {/* Seções de categorias skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-2xl overflow-hidden"
          >
            {/* Cabeçalho da categoria skeleton */}
            <div className="p-4 border-b border-[var(--on-background)]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Botões de reordenar skeleton */}
                  <div className="flex gap-1">
                    <div className="w-8 h-8 bg-[var(--on-background)]/10 rounded-lg"></div>
                    <div className="w-8 h-8 bg-[var(--on-background)]/10 rounded-lg"></div>
                  </div>
                  {/* Título da categoria skeleton */}
                  <div className="h-6 w-40 bg-[var(--on-background)]/10 rounded-lg"></div>
                </div>
                {/* Botões de ação skeleton */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[var(--on-background)]/10 rounded-lg"></div>
                  <div className="w-10 h-10 bg-[var(--on-background)]/10 rounded-lg"></div>
                  <div className="h-10 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Grid de produtos skeleton */}
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((productIndex) => (
                  <div
                    key={productIndex}
                    className="bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-xl overflow-hidden"
                  >
                    {/* Imagem do produto skeleton */}
                    <div className="w-full aspect-square bg-[var(--on-background)]/10"></div>
                    
                    {/* Conteúdo do produto skeleton */}
                    <div className="p-4 space-y-2">
                      {/* Título skeleton */}
                      <div className="h-4 w-full bg-[var(--on-background)]/10 rounded"></div>
                      <div className="h-4 w-3/4 bg-[var(--on-background)]/10 rounded"></div>
                      
                      {/* Preço skeleton */}
                      <div className="h-5 w-24 bg-[var(--on-background)]/10 rounded mt-2"></div>
                      
                      {/* Botões de ação skeleton */}
                      <div className="flex gap-2 mt-3">
                        <div className="h-9 flex-1 bg-[var(--on-background)]/10 rounded-lg"></div>
                        <div className="h-9 w-9 bg-[var(--on-background)]/10 rounded-lg"></div>
                        <div className="h-9 w-9 bg-[var(--on-background)]/10 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

