'use client';

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Menu, 
  X,
  ChevronLeft,
  PackageIcon,
  Users,
  ShoppingCart,
  CreditCard,
  BookOpen,
  GraduationCap
} from "lucide-react";
import Button from "@/app/components/buttons/button";
import IconOnlyButton from "@/app/components/buttons/iconOnlyButton";
import { useStoreCompletion } from "@/lib/hooks/useStoreCompletion";
import SidebarButton from "@/app/components/buttons/sidebarButton";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/seller/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Catálogo",
    href: "/seller/catalog",
    icon: BookOpen,
  },

  {
    label: "Produtos",
    href: "/seller/products",
    icon: PackageIcon,
  },
  {
    label: "Vendas",
    href: "/seller/sales",
    icon: TrendingUp,
  },
  {
    label: "Clientes",
    href: "/seller/clients",
    icon: Users,
  },
  {
    label: "Loja",
    href: "/seller/store",
    icon: ShoppingCart,
  },
  {
    label: "Integrações",
    href: "/seller/integrations",
    icon: CreditCard,
  },
  {
    label: "Tutoriais",
    href: "/seller/tutorials",
    icon: GraduationCap,
  },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { storeStatus, isLoading } = useStoreCompletion();

  // Force desktop-only collapse behavior
  const toggleCollapse = () => {
    // Only allow collapse on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsCollapsed(!isCollapsed);
    }
  };
  
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  // Reset collapsed state on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Force expanded on mobile
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force collapsed to false on mobile during render
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveIsCollapsed = isMobile ? false : isCollapsed;

  // Função para verificar se pode navegar
  const canNavigate = (href: string) => {
    // Se está na página de configuração da loja, permitir navegação
    if (href === '/seller/store') {
      return true;
    }
    
    // Tutoriais sempre acessível (seção de ensino)
    if (href === '/seller/tutorials') {
      return true;
    }
    
    // Se a loja está completa, permitir navegação
    if (storeStatus?.isComplete) {
      return true;
    }
    
    // Se a loja não está completa e não é a página de configuração, bloquear
    return false;
  };

  // Função para lidar com clique nos links
  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (!canNavigate(href)) {
      e.preventDefault();
      router.push('/seller/store?incomplete=true');
    }
  };

  // Ouvir evento global vindo da navbar para alternar a sidebar no mobile
  useEffect(() => {
    const handler = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener('toggle-mobile-sidebar' as unknown as keyof WindowEventMap, handler as EventListener);
    return () => {
      window.removeEventListener('toggle-mobile-sidebar' as unknown as keyof WindowEventMap, handler as EventListener);
    };
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/5 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40
          h-screen bg-[var(--surface)] border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${effectiveIsCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${className}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 mt-16 md:mt-0">
            {(!effectiveIsCollapsed || isMobileOpen) && (
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="Ckeet Logo" 
                  width={140} 
                  height={40} 
                  className="h-auto" 
                  priority
                />
              </div>
            )}
            
            {/* Desktop Collapse Button */}
            <IconOnlyButton
              icon={ChevronLeft}
              onClick={toggleCollapse}
              variant="surface"
              className={`hidden md:flex w-8 h-8 ${effectiveIsCollapsed ? "rotate-180" : ""}`}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const canNavigateToItem = canNavigate(item.href);
                
                // Adicionar divider antes do último item (Tutoriais)
                const isLastItem = index === menuItems.length - 1;
                
                return (
                  <li key={item.href}>
                    {/* Divider antes do último item */}
                    {isLastItem && (
                      <div className="my-4 border-t border-gray-200"></div>
                    )}
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        setIsMobileOpen(false);
                        handleLinkClick(item.href, e);
                      }}
                      className={!canNavigateToItem ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <>
                        {/* Desktop: usando SidebarButton com ícones alinhados */}
                        <div className="hidden md:block">
                          <SidebarButton
                            icon={Icon}
                            label={item.label}
                            isActive={isActive}
                            collapsed={effectiveIsCollapsed}
                            disabled={!canNavigateToItem}
                          />
                        </div>
                        
                        {/* Mobile: sempre expandido com SidebarButton */}
                        <div className="block md:hidden">
                          <SidebarButton
                            icon={Icon}
                            label={item.label}
                            isActive={isActive}
                            collapsed={false}
                            disabled={!canNavigateToItem}
                          />
                        </div>
                      </>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>


        </div>
      </aside>
    </>
  );
}