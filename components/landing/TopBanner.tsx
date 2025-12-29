'use client';

import { useScrolled } from '@/hooks/useScrolled';

/**
 * Promotional banner displayed at the top of the page.
 * Used for launch announcements and calls-to-action.
 * Fixed position that hides on scroll to allow navigation to expand.
 */
export function TopBanner() {
  const scrolled = useScrolled(50);

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-[#003DA5] text-white text-[10px] md:text-xs font-bold py-1.5 md:py-2 text-center tracking-wider uppercase
        transition-all duration-300
        ${scrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
      `}
    >
      Launch Season: Beta Access Now Open
    </div>
  );
}

