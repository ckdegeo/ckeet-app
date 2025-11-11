'use client';

import Link from 'next/link';

interface FooterProps {
  store: {
    name: string;
    logoUrl?: string | null;
    contactEmail?: string | null;
    primaryColor?: string | null;
  };
}

export default function Footer({ store }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-[var(--on-background)]/20 py-8">
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
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {store.name}
            </span>
            {store.contactEmail && (
              <a
                href={`mailto:${store.contactEmail}`}
                className="text-xs text-[var(--on-background)] hover:text-[var(--foreground)] transition-colors"
              >
                {store.contactEmail}
              </a>
            )}
          </div>
        </div>

        {/* Ckeet credit */}
        <div className="text-center md:text-right text-xs text-[var(--on-background)]">
          <span className="block md:inline">
            © {new Date().getFullYear()} {store.name}
          </span>
          <span className="hidden md:inline mx-2">•</span>
          <span className="block md:inline">
            Loja criada com <span className="text-[var(--secondary)]">❤️</span> pela plataforma Ckeet
          </span>
        </div>
      </div>
    </footer>
  );
}
