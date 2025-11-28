'use client';

import { useRef, useState, useEffect, type RefObject } from 'react';

/**
 * Custom hook that detects when an element enters the viewport.
 * Uses Intersection Observer API for performant scroll-based reveals.
 * Once revealed, the element stays revealed (one-time animation trigger).
 *
 * @param threshold - Visibility threshold to trigger reveal (number between 0-1, default: 0.1)
 * @returns Tuple containing [ref to attach to element, boolean indicating if revealed]
 *
 * @example
 * ```tsx
 * const [ref, isRevealed] = useReveal(0.2);
 * return (
 *   <div ref={ref} className={isRevealed ? 'opacity-100' : 'opacity-0'}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold: number = 0.1
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isRevealed];
}

