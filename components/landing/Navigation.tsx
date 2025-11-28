'use client';

import { useState } from 'react';
import { Crown, Menu, X } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';
import type { NavItem } from '@/types/landing';

/** Navigation menu items */
const NAV_ITEMS: NavItem[] = [
  { label: 'Royale Rankings', href: '#rankings' },
  { label: 'Features', href: '#features' },
  { label: 'Roadmap', href: '#roadmap' },
];

/**
 * Main navigation bar with glass morphism effect on scroll.
 * Includes responsive mobile menu with hamburger toggle.
 * Transforms from transparent to glass effect when user scrolls past 50px.
 */
export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrolled = useScrolled(50);

  /**
   * Closes the mobile menu when a navigation link is clicked.
   */
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`
        fixed w-full z-50 transition-all duration-300
        ${scrolled ? 'glass bg-[#0D0D0D]/90' : 'bg-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <Crown className="text-[#FFD700]" size={28} />
            <span className="font-bold text-xl tracking-tight">
              CLASH<span className="text-[#4717F6]">CAMPUS</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="hover:text-[#FFD700] transition-colors text-sm font-medium tracking-wide"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="bg-white text-[#0D0D0D] hover:bg-[#FFD700] hover:text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105">
              Verify Student ID
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0D0D0D] border-b border-gray-800 absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md"
                onClick={handleNavClick}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#"
              className="block px-3 py-2 text-base font-bold text-[#FFD700]"
            >
              Verify Student ID
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

