'use client';

export default function ShopProductSkeleton() {
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

      {/* Conteúdo do Produto */}
      <main className="container mx-auto px-8 py-8">
        {/* Botão de Voltar */}
        <div className="mb-6">
          <div className="h-12 w-32 bg-gray-200 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div className="space-y-3">
            {/* Imagem Principal */}
            <div className="aspect-square bg-gray-200 rounded-xl"></div>

            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="flex flex-col space-y-6">
            {/* Header do Produto */}
            <div className="pb-6 border-b border-gray-200">
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            {/* Descrição */}
            <div className="py-6 border-b border-gray-200 space-y-3">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Features */}
            <div className="py-6 border-b border-gray-200 space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de Compra */}
            <div className="pt-6">
              <div className="h-14 w-full bg-gray-200 rounded-full"></div>
            </div>
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

