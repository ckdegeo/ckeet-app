'use client';

interface TutorialsSkeletonProps {
  showAddButton?: boolean;
}

export default function TutorialsSkeleton({ showAddButton = false }: TutorialsSkeletonProps) {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Cabeçalho skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Título skeleton */}
        <div className="h-8 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search bar skeleton */}
          <div className="h-10 flex-1 sm:max-w-md bg-[var(--on-background)]/10 rounded-lg"></div>
          
          {/* Botão skeleton (apenas se showAddButton for true) */}
          {showAddButton && (
            <div className="h-10 w-32 bg-[var(--on-background)]/10 rounded-lg"></div>
          )}
        </div>
      </div>

      {/* Seções skeleton */}
      <div className="space-y-12">
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-4">
            {/* Divider antes de cada seção (exceto a primeira) */}
            {index > 1 && (
              <div className="mb-6 -mt-12 border-t border-[var(--on-background)]/10"></div>
            )}
            
            {/* Título da seção skeleton */}
            <div className="h-7 w-48 bg-[var(--on-background)]/10 rounded-lg"></div>

            {/* Carrossel de vídeos skeleton */}
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((videoIndex) => (
                <div
                  key={videoIndex}
                  className="flex-shrink-0 w-[320px] bg-[var(--surface)] border border-[var(--on-background)]/10 rounded-xl overflow-hidden"
                >
                  {/* Thumbnail skeleton */}
                  <div className="w-full aspect-video bg-[var(--on-background)]/10"></div>
                  
                  {/* Título skeleton */}
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-full bg-[var(--on-background)]/10 rounded"></div>
                    <div className="h-4 w-3/4 bg-[var(--on-background)]/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

