'use client';

import { MessageCircle, Youtube, Instagram, Twitter, Send, AtSign } from 'lucide-react';

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

  // Função para obter ícone por plataforma
  const getIcon = (platform: string) => {
    const iconProps = { size: 20, strokeWidth: 2 };
    
    switch (platform) {
      case 'discord':
        return <MessageCircle {...iconProps} />;
      case 'youtube':
        return <Youtube {...iconProps} />;
      case 'instagram':
        return <Instagram {...iconProps} />;
      case 'twitter':
        return <Twitter {...iconProps} />;
      case 'telegram':
        return <Send {...iconProps} />;
      case 'threads':
        return <AtSign {...iconProps} />;
      default:
        return null;
    }
  };

  // Função para abrir link em nova aba
  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-3">
      {activeSocials.map((social) => (
        <button
          key={social.platform}
          onClick={() => handleClick(social.url)}
          className="
            w-10 h-10
            rounded-full
            flex items-center justify-center
            transition-all duration-200
            hover:scale-110
            hover:shadow-lg
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
          "
          style={{
            backgroundColor: primaryColor,
            color: '#ffffff',
            '--hover-bg': secondaryColor,
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = secondaryColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = primaryColor;
          }}
          aria-label={`Visitar ${social.platform}`}
          title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
        >
          {getIcon(social.platform)}
        </button>
      ))}
    </div>
  );
}

