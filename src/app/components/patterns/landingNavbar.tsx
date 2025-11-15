'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, LogIn, ArrowRight } from 'lucide-react';
import Button from '@/app/components/buttons/button';

interface LandingNavbarProps {
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
  className?: string;
}

export default function LandingNavbar({
  onLoginClick,
  onGetStartedClick,
  className = ''
}: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detectar scroll para mudar estilo da navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu mobile ao clicar em um link
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    handleLinkClick();
    if (onLoginClick) {
      onLoginClick();
    } else {
      window.location.href = '/seller/auth/login';
    }
  };

  const handleGetStarted = () => {
    handleLinkClick();
    if (onGetStartedClick) {
      onGetStartedClick();
    } else {
      window.location.href = '/seller/auth/register';
    }
  };

  const scrollToSection = (sectionId: string) => {
    handleLinkClick();
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <nav
          className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${isScrolled 
            ? 'bg-[var(--background)]/95 backdrop-blur-sm shadow-sm' 
            : 'bg-transparent'
          }
          ${className}
        `}
        style={{
          fontFamily: 'var(--font-manrope), Manrope, sans-serif'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group"
              onClick={handleLinkClick}
            >
              <div className="relative w-24 h-24">
                <Image
                  src="/logo.png"
                  alt="Ckeet Logo"
                  fill
                  className="object-contain transition-transform group-hover:scale-105"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation Links - Oculto por enquanto (minimalista) */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
              {/* Links podem ser adicionados aqui no futuro */}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleLogin}
                className="px-4 py-2 text-sm"
              >
                <LogIn size={16} />
                Login
              </Button>
              <Button
                variant="primary"
                onClick={handleGetStarted}
                className="px-6 py-2 text-sm"
              >
                Começar agora
                <ArrowRight size={16} />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} className="text-[var(--foreground)]" />
              ) : (
                <Menu size={24} className="text-[var(--foreground)]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`
            md:hidden
            overflow-hidden transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
            bg-[var(--background)] border-t border-gray-200/50
          `}
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Button
              variant="outline"
              onClick={handleLogin}
              className="w-full justify-center px-4 py-2 text-sm"
            >
              <LogIn size={16} />
              Login
            </Button>
            <Button
              variant="primary"
              onClick={handleGetStarted}
              className="w-full justify-center px-4 py-2 text-sm"
            >
              Começar agora
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Spacer para compensar navbar fixa */}
      <div className="h-16 md:h-20" />
    </>
  );
}

