'use client';

export default function ShopOrdersSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" style={{ backgroundColor: '#f9fafb' }}>
      {/* Navbar Skeleton */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-8 py-12">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 w-32 bg-gray-200 rounded"></div>
          <div className="h-12 w-32 bg-gray-200 rounded-full"></div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Tabela Skeleton */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header da Tabela */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-10 w-full sm:w-80 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Corpo da Tabela */}
          <div className="p-6">
            {/* Cabeçalho da Tabela */}
            <div className="hidden md:grid grid-cols-8 gap-4 mb-4 pb-4 border-b border-gray-200">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>

            {/* Linhas da Tabela */}
            {[1, 2, 3, 4, 5].map((rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-1 md:grid-cols-8 gap-4 py-4 border-b border-gray-100 last:border-0"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((cellIndex) => (
                  <div key={cellIndex} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <div className="border-t border-gray-200 bg-white mt-16">
        <div className="container mx-auto px-8 py-8">
          <div className="h-6 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

