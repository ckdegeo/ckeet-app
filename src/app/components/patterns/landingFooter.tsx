'use client';

import Link from 'next/link';
import { SiDiscord, SiWhatsapp, SiInstagram, SiX } from 'react-icons/si';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Discord',
      url: 'https://discord.gg/2MDfgFxyrq',
      icon: SiDiscord,
    },
    {
      name: 'WhatsApp',
      url: 'https://chat.whatsapp.com/LRmA36FzPlFA3hWK4s82Eg',
      icon: SiWhatsapp,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/ckeet_app/',
      icon: SiInstagram,
    },
    {
      name: 'Twitter/X',
      url: 'https://x.com/ckeet_store',
      icon: SiX,
    },
  ];

  return (
    <footer 
      className="relative border-t border-[var(--on-background)]/10 py-8 md:py-12"
      style={{ 
        backgroundColor: 'var(--background)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div 
            className="text-sm md:text-base"
            style={{ 
              fontFamily: 'var(--font-manrope), Manrope, sans-serif',
              color: 'var(--on-background)'
            }}
          >
            © {currentYear} Ckeet. Todos os direitos reservados.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg transition-all hover:scale-110"
                  style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  aria-label={social.name}
                >
                  <Icon size={20} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

