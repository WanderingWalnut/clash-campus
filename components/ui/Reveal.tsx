'use client';

import { useReveal } from '@/hooks/useReveal';

interface RevealProps {
  /** Content to reveal on scroll */
  children: React.ReactNode;
  /** Additional CSS classes to apply */
  className?: string;
  /** Animation delay class (e.g., 'delay-100', 'delay-200') */
  delay?: string;
}

/**
 * A wrapper component that animates its children into view when scrolled into the viewport.
 * Uses a fade-in and slide-up animation triggered by Intersection Observer.
 *
 * @param children - The content to animate (React.ReactNode)
 * @param className - Additional CSS classes to apply to the wrapper (string, optional)
 * @param delay - Tailwind delay class for staggered animations (string, optional)
 *
 * @example
 * ```tsx
 * <Reveal delay="delay-200">
 *   <h1>This will fade in when scrolled into view</h1>
 * </Reveal>
 * ```
 */
export function Reveal({ children, className = '', delay = '' }: RevealProps) {
  const [ref, isRevealed] = useReveal();

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-1000 ease-out transform
        ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        ${delay}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

