'use client';

export default function ShopSkeleton() {
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

      {/* Banner Skeleton */}
      <div className="container mx-auto px-8 py-6">
        <div className="w-full h-72 bg-gray-200 rounded-2xl"></div>
      </div>

      {/* Redes Sociais Skeleton */}
      <div className="container mx-auto px-8 py-4 flex justify-center gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-10 h-10 bg-gray-200 rounded-full"></div>
        ))}
      </div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-8 py-8 space-y-16">
        {/* Categoria Skeleton */}
        {[1, 2].map((categoryIndex) => (
          <section key={categoryIndex} className="space-y-6">
            {/* Título da Categoria */}
            <div className="flex items-center gap-4">
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
              <div className="flex-1 h-1 bg-gray-200 rounded-full"></div>
            </div>

            {/* Grid de Produtos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((productIndex) => (
                <div
                  key={productIndex}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Imagem do Produto */}
                  <div className="aspect-square bg-gray-200"></div>

                  {/* Conteúdo */}
                  <div className="p-3 space-y-3">
                    <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                      <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>

                  <hr className="my-2 border-gray-200" />

                  {/* Botão */}
                  <div className="p-3 pt-0">
                    <div className="h-10 w-full bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
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

