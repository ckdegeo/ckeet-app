'use client';

export default function ShopAuthSkeleton() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row animate-pulse">
      {/* Lado Esquerdo - Banner Skeleton */}
      <div className="hidden md:flex md:w-1/2 relative border-r border-gray-200">
        <div className="w-full h-full bg-gray-200"></div>
      </div>

      {/* Lado Direito - Formulário Skeleton */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo e Título */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Formulário */}
          <div className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
            </div>

            {/* Checkbox e Link */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>

            {/* Botão Principal */}
            <div className="h-12 w-full bg-gray-200 rounded-lg"></div>

            {/* Botão Secundário */}
            <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

