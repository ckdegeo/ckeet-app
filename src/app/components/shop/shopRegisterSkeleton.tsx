'use client';

export default function ShopRegisterSkeleton() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row animate-pulse">
      {/* Lado Esquerdo - Banner Skeleton */}
      <div className="hidden md:flex md:w-1/2 relative border-r border-gray-200">
        <div className="w-full h-full bg-gray-200"></div>
      </div>

      {/* Lado Direito - Formulário Skeleton */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo e Título */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Formulário */}
          <div className="space-y-6">
            {/* Campo Nome */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
            </div>

            {/* Campo Telefone */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
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

