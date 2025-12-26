'use client';

import { useScrolled } from '@/hooks/useScrolled';
import type { ReactNode } from 'react';

/**
 * Client-side wrapper for Hero section that handles scroll-based padding.
 * Extracted to minimize client-side JavaScript while keeping the scroll effect.
 */
interface HeroSectionWrapperProps {
  children: ReactNode;
}

export function HeroSectionWrapper({ children }: HeroSectionWrapperProps) {
  const scrolled = useScrolled(50);

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-300 ${
        scrolled ? 'pt-16 md:pt-20' : 'pt-[100px] md:pt-[116px]'
      }`}
    >
      {children}
    </section>
  );
}

