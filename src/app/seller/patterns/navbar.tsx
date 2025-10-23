'use client';

import { Search as SearchIcon, Store } from "lucide-react";
import UserMenu from "@/app/components/user/userMenu";
import IconOnlyButton from "@/app/components/buttons/iconOnlyButton";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";

interface NavbarProps {
  className?: string;
  title?: string;
}

export default function Navbar({ className = "", title = "Seller" }: NavbarProps) {
  const { user } = useAuth();
  const [sellerName, setSellerName] = useState<string>("");
  const [storeSubdomain, setStoreSubdomain] = useState<string>("");
  
  // Buscar nome do seller e subdomínio da loja
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!user?.id) return;
      
      try {
        const accessToken = localStorage.getItem('access_token');
        console.log('🔑 Token:', accessToken ? 'Encontrado' : 'Não encontrado');
        
        // Buscar dados do seller e loja
        const response = await fetch(`/api/seller/store/config`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Store data:', data);
          setSellerName(data.store?.name || user.name || "Usuário");
          setStoreSubdomain(data.store?.subdomain || "");
          console.log('🏪 Subdomain:', data.store?.subdomain);
        } else {
          console.log('❌ API Error:', response.status);
          setSellerName(user.name || "Usuário");
        }
      } catch (error) {
        console.log('💥 Fetch error:', error);
        setSellerName(user.name || "Usuário");
      }
    };

    fetchSellerData();
  }, [user?.id, user?.name]);

  return (
    <nav className={`
      bg-[var(--surface)] border-b border-gray-200 px-4 py-3
      ${className}
    `}>
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Search */}
        <div className="flex items-center gap-6 flex-1">
          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <SearchIcon size={20} className="text-[var(--foreground)]" />
          </button>

          {/* Store Button */}
          <IconOnlyButton
            icon={Store}
            onClick={() => {
              console.log('🖱️ Store button clicked');
              console.log('🏪 Store subdomain:', storeSubdomain);
              
              if (storeSubdomain) {
                // Navegar para a loja dinâmica do seller
                const storeUrl = `https://${storeSubdomain}.ckeet.store`;
                console.log('🌐 Opening store URL:', storeUrl);
                window.open(storeUrl, '_blank');
              } else {
                // Se não tem subdomínio, redirecionar para configuração da loja
                console.log('⚙️ No subdomain, redirecting to store config');
                window.location.href = '/seller/store';
              }
            }}
            variant="surface"
            title={storeSubdomain ? `Visualizar minha loja (${storeSubdomain}.ckeet.store)` : "Configurar loja"}
          />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}