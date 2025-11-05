'use client';

import type React from 'react';
// Ícones de marca
import { FaDiscord, FaYoutube, FaInstagram, FaXTwitter, FaTelegram } from 'react-icons/fa6';
import { SiThreads } from 'react-icons/si';

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface SocialLinksProps {
  socials: {
    discordUrl?: string;
    discordEnabled?: boolean;
    youtubeUrl?: string;
    youtubeEnabled?: boolean;
    instagramUrl?: string;
    instagramEnabled?: boolean;
    twitterUrl?: string;
    twitterEnabled?: boolean;
    telegramUrl?: string;
    telegramEnabled?: boolean;
    threadsUrl?: string;
    threadsEnabled?: boolean;
  };
  primaryColor?: string;
  secondaryColor?: string;
}

export default function SocialLinks({ socials, primaryColor = '#bd253c', secondaryColor = '#970b27' }: SocialLinksProps) {
  // Mapear redes sociais com ícones
  const socialPlatforms: SocialLink[] = [
    {
      platform: 'discord',
      url: socials.discordUrl || '',
      enabled: socials.discordEnabled || false,
    },
    {
      platform: 'youtube',
      url: socials.youtubeUrl || '',
      enabled: socials.youtubeEnabled || false,
    },
    {
      platform: 'instagram',
      url: socials.instagramUrl || '',
      enabled: socials.instagramEnabled || false,
    },
    {
      platform: 'twitter',
      url: socials.twitterUrl || '',
      enabled: socials.twitterEnabled || false,
    },
    {
      platform: 'telegram',
      url: socials.telegramUrl || '',
      enabled: socials.telegramEnabled || false,
    },
    {
      platform: 'threads',
      url: socials.threadsUrl || '',
      enabled: socials.threadsEnabled || false,
    },
  ];

  // Filtrar apenas redes habilitadas e com URL
  const activeSocials = socialPlatforms.filter(
    (social) => social.enabled && social.url && social.url.trim() !== ''
  );

  // Se não houver redes ativas, não renderizar nada
  if (activeSocials.length === 0) {
    return null;
  }

  // Ícones e cores oficiais por rede
  const iconFor: Record<string, React.ReactNode> = {
    discord: <FaDiscord size={18} />,
    youtube: <FaYoutube size={18} />,
    instagram: <FaInstagram size={18} />,
    twitter: <FaXTwitter size={18} />,
    telegram: <FaTelegram size={18} />,
    threads: <SiThreads size={18} />,
  };

  const colorFor: Record<string, { bg: string; hover: string }> = {
    discord: { bg: '#5865F2', hover: '#4752C4' },
    youtube: { bg: '#FF0000', hover: '#CC0000' },
    instagram: { bg: '#E4405F', hover: '#C13584' },
    twitter: { bg: '#000000', hover: '#111111' }, // X (preto)
    telegram: { bg: '#26A5E4', hover: '#1C7FB9' },
    threads: { bg: '#000000', hover: '#111111' },
  };

  // Função para abrir link em nova aba
  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Floating vertical stack on center-right
  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
      aria-label="Social links"
    >
      {activeSocials.map((social) => {
        const colors = colorFor[social.platform] || { bg: primaryColor, hover: secondaryColor };
        return (
          <button
            key={social.platform}
            onClick={() => handleClick(social.url)}
            className="
              w-11 h-11
              rounded-full
              flex items-center justify-center
              transition-all duration-200
              hover:scale-110
              shadow-md hover:shadow-lg
              focus:outline-none
              focus:ring-2 focus:ring-white/60
            "
            style={{ backgroundColor: colors.bg, color: '#ffffff' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg;
            }}
            aria-label={`Visitar ${social.platform}`}
            title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
          >
            {iconFor[social.platform]}
          </button>
        );
      })}
    </div>
  );
}

