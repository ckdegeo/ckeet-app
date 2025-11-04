'use client';

import { useEffect, useState } from 'react';
import CatalogCategorySection from '@/app/components/categories/CatalogCategorySection';
import Selector from '@/app/components/selectors/selector';
import IconOnlyButton from '@/app/components/buttons/iconOnlyButton';
import { AlertCircle } from 'lucide-react';
import CatalogFeeNoticeModal from '@/app/components/modals/catalogFeeNoticeModal';
import { useRouter } from 'next/navigation';
import { invalidateProductCategoryCaches } from '@/lib/utils/cacheInvalidation';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toastUtils';
import ImportSelectCategoryModal from '@/app/components/modals/importSelectCategoryModal';

interface CatalogProductDisplay {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  order: number;
}

export default function CatalogPage() {
  const [niche, setNiche] = useState('all');
  const [showNotice, setShowNotice] = useState(false);
  const [sections, setSections] = useState<{ id: string; name: string; products: CatalogProductDisplay[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectCategoryOpen, setSelectCategoryOpen] = useState(false);
  const [pendingSourceProductId, setPendingSourceProductId] = useState<string | null>(null);
  const [pendingCatalogCategoryId, setPendingCatalogCategoryId] = useState<string | null>(null);
  const router = useRouter();

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Sessão expirada');
      const headers = { 'Authorization': `Bearer ${accessToken}` } as const;
      const res = await fetch('/api/seller/catalog/categories', { headers, cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao carregar categorias');
      const categories: Array<{ id: string; name: string; order: number }> = data.data.categories || [];
      const results = await Promise.all(categories.map(async (cat) => {
        const r = await fetch(`/api/seller/catalog/products?catalogCategoryId=${cat.id}`, { headers, cache: 'no-store' });
        const d = await r.json();
        interface ProductResponse {
          id: string;
          name: string;
          price: number;
          imageUrl?: string;
          order?: number;
        }
        const products: CatalogProductDisplay[] = ((d?.data?.products || []) as ProductResponse[]).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl || '',
          order: p.order || 0,
        }));
        return { id: cat.id, name: cat.name, products };
      }));
      setSections(results);
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Erro ao carregar catálogo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleImport = async (sourceProductId: string) => {
    setPendingSourceProductId(sourceProductId);
    setSelectCategoryOpen(true);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Catálogo
          </h1>
          <div className="flex items-center gap-2 w-full sm:w-64 justify-end">
            {/* Botão de aviso com pulso */}
            <div className="relative">
              <span
                className="cursor-pointer absolute inset-0 rounded-full bg-[var(--primary)] opacity-30 animate-ping"
                onClick={() => setShowNotice(true)}
              ></span>
              <IconOnlyButton
                icon={AlertCircle}
                onClick={() => setShowNotice(true)}
                variant="surface"
                className="w-10 h-10 z-[1] "
                aria-label="Aviso de taxa do catálogo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seções do catálogo */}
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <CatalogCategorySection
            key={section.id}
            id={section.id}
            name={section.name}
            products={section.products}
            onImport={handleImport}
            onImportSection={async (catalogCategoryId) => {
              try {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) throw new Error('Sessão expirada');
                const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } as const;
                const res = await fetch('/api/seller/catalog/import/category', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ catalogCategoryId })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Erro ao importar categoria');
                const imp = data?.data?.imported ?? 0;
                const skipped = data?.data?.skipped ?? 0;
                if (imp > 0) {
                  showSuccessToast(`Importados ${imp} produto(s).`);
                  // Invalidar cache antes de redirecionar
                  try {
                    const token = localStorage.getItem('access_token');
                    if (token) {
                      const payload = JSON.parse(atob(token.split('.')[1]));
                      const userId = payload.userId || payload.sub;
                      if (userId) {
                        invalidateProductCategoryCaches(userId);
                      }
                    }
                  } catch (error) {
                    // Ignorar erro de parsing do token
                  }
                  // levar o seller para ver os produtos importados
                  router.push('/seller/products');
                }
                if (skipped > 0) showErrorToast(`${skipped} produto(s) ignorados (já importados).`);
              } catch (e) {
                showErrorToast(e instanceof Error ? e.message : 'Erro ao importar categoria');
              }
            }}
          />
        ))}
      </div>

      {/* Modal de aviso da taxa do catálogo */}
      <CatalogFeeNoticeModal isOpen={showNotice} onClose={() => setShowNotice(false)} />

      {/* Modal para selecionar categoria antes de importar */}
      <ImportSelectCategoryModal
        isOpen={selectCategoryOpen}
        onClose={() => setSelectCategoryOpen(false)}
        onConfirm={async (targetCategoryId) => {
          try {
            // Decide se é importação individual ou por categoria
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) throw new Error('Sessão expirada');
            const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } as const;
            if (pendingSourceProductId) {
              const res = await fetch('/api/seller/catalog/import', {
                method: 'POST',
                headers,
                body: JSON.stringify({ sourceProductId: pendingSourceProductId, targetCategoryId })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Erro ao importar');
              if (data?.data?.alreadyImported) {
                showErrorToast('Este produto já foi importado para a sua loja.');
              } else {
                showSuccessToast('Produto importado!');
                // Invalidar cache após importação bem-sucedida
                try {
                  const token = localStorage.getItem('access_token');
                  if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userId = payload.userId || payload.sub;
                    if (userId) {
                      invalidateProductCategoryCaches(userId);
                    }
                  }
                } catch (error) {
                  // Ignorar erro de parsing do token
                }
              }
              setPendingSourceProductId(null);
            } else if (pendingCatalogCategoryId) {
              const res = await fetch('/api/seller/catalog/import/category', {
                method: 'POST',
                headers,
                body: JSON.stringify({ catalogCategoryId: pendingCatalogCategoryId, targetCategoryId })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Erro ao importar categoria');
              const imp = data?.data?.imported ?? 0;
              const skipped = data?.data?.skipped ?? 0;
              if (imp > 0) showSuccessToast(`Importados ${imp} produto(s).`);
              if (skipped > 0) showErrorToast(`${skipped} produto(s) ignorados (já importados).`);
              setPendingCatalogCategoryId(null);
            }
          } catch (e) {
            showErrorToast(e instanceof Error ? e.message : 'Erro ao importar');
          }
        }}
      />
    </div>
  );
}