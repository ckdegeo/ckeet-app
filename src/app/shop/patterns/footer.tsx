'use client';

import Link from 'next/link';

interface FooterProps {
  store: {
    name: string;
    logoUrl?: string | null;
    contactEmail?: string | null;
    primaryColor?: string | null;
    appearanceConfig?: unknown;
  };
}

export default function Footer({ store }: FooterProps) {
  // Configurações padrão do footer
  const appearanceConfig = store.appearanceConfig as { footer?: { backgroundColor: string; textColor: string; opacity: number } } | undefined;
  const footerConfig = appearanceConfig?.footer || {
    backgroundColor: '#ffffff',
    textColor: '#111827',
    opacity: 100,
  };

  const footerOpacity = footerConfig.opacity / 100;

  return (
    <footer 
      className="mt-16 border-t border-[var(--on-background)]/20 py-8"
      style={{
        backgroundColor: footerConfig.backgroundColor,
        opacity: footerOpacity,
      }}
    >
      <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Seller info */}
        <div className="flex items-center gap-3">
          {store.logoUrl && (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="h-8 w-8 rounded-lg object-contain"
            />
          )}
          <div className="flex flex-col">
            <span 
              className="text-sm font-semibold"
              style={{ color: footerConfig.textColor }}
            >
              {store.name}
            </span>
            {store.contactEmail && (
              <a
                href={`mailto:${store.contactEmail}`}
                className="text-xs hover:opacity-80 transition-opacity"
                style={{ color: footerConfig.textColor, opacity: 0.7 }}
              >
                {store.contactEmail}
              </a>
            )}
          </div>
        </div>

        {/* Ckeet credit */}
        <div 
          className="text-center md:text-right text-xs"
          style={{ color: footerConfig.textColor, opacity: 0.7 }}
        >
          <span className="block md:inline">
            © {new Date().getFullYear()} {store.name}
          </span>
          <span className="hidden md:inline mx-2">•</span>
          <span className="block md:inline">
            Loja criada com <span style={{ color: store.primaryColor || '#bd253c' }}>❤️</span> pela plataforma Ckeet
          </span>
        </div>
      </div>
    </footer>
  );
}
