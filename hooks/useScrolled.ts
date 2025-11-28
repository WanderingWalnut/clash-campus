'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook that tracks whether the page has been scrolled past a threshold.
 * Useful for triggering navigation bar style changes on scroll.
 *
 * @param threshold - The scroll position (in pixels) that triggers the scrolled state (number, default: 50)
 * @returns Boolean indicating whether the page has scrolled past the threshold
 *
 * @example
 * ```tsx
 * const isScrolled = useScrolled(100);
 * // Returns true when window.scrollY > 100
 * ```
 */
export function useScrolled(threshold: number = 50): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}

