'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Crown, Menu, X, User, LogOut } from 'lucide-react';
import { useScrolled, useAuth } from '@/hooks';
import { createClient } from '@/lib/supabase/client';
import type { NavItem } from '@/types/landing';

/** Navigation menu items */
const NAV_ITEMS: NavItem[] = [
  { label: 'Royale Rankings', href: '/rankings' },
  { label: 'Features', href: '/#features' },
  { label: 'Roadmap', href: '/#roadmap' },
];

/**
 * Main navigation bar with glass morphism effect on scroll.
 * Includes responsive mobile menu with hamburger toggle.
 * Transforms from transparent to glass effect when user scrolls past 50px.
 */
export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const scrolled = useScrolled(50);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  /**
   * Closes the mobile menu when a navigation link is clicked.
   */
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  /**
   * Handles user logout.
   * Signs out via Supabase and refreshes server state.
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setIsMobileMenuOpen(false);
    }
  };

  /**
   * Checks if a nav item is currently active based on the pathname.
   *
   * @param href - The href to check against the current pathname
   * @returns Boolean indicating if the nav item is active
   */
  const isActive = (href: string): boolean => {
    if (href === '/rankings') {
      return pathname === '/rankings';
    }
    return false;
  };

  return (
    <nav
      className={`
        fixed w-full transition-all duration-300 border-0
        ${scrolled ? 'top-0 z-50 glass' : 'top-[36px] z-40 bg-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Crown className="text-[#FFD700]" size={28} />
            <span className="font-bold text-xl tracking-tight">
              CLASH<span className="text-[#4717F6]">CAMPUS</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`
                    hover:text-[#FFD700] transition-colors text-sm font-medium tracking-wide
                    ${isActive(item.href) ? 'text-[#FFD700]' : 'text-white'}
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button / User Menu */}
          <div className="hidden md:block">
            {isLoading ? (
              // Loading skeleton
              <div className="w-24 h-10 bg-gray-700/50 rounded-full animate-pulse" />
            ) : user ? (
              // Authenticated: Show user menu with logout
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </button>
              </div>
            ) : (
              // Not authenticated: Show signup CTA
              <Link
                href="/signup"
                className="bg-white text-[#0D0D0D] hover:bg-[#FFD700] hover:text-black px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 inline-block"
              >
                Verify Student ID
              </Link>
            )}
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
              <Link
                key={item.label}
                href={item.href}
                className={`
                  block px-3 py-2 text-base font-medium rounded-md
                  ${isActive(item.href)
                    ? 'text-[#FFD700] bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }
                `}
                onClick={handleNavClick}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              // Authenticated: Show user info and logout
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                </button>
              </>
            ) : (
              // Not authenticated: Show signup link
              <Link
                href="/signup"
                className="block px-3 py-2 text-base font-bold text-[#FFD700]"
                onClick={handleNavClick}
              >
                Verify Student ID
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
