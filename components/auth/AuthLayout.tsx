'use client';

import { Crown } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Shared layout component for authentication pages.
 * Provides consistent background effects, header, and container styling.
 *
 * @param title - The main heading text
 * @param subtitle - The subtitle/description text
 * @param children - The form content to display
 */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen pt-32 pb-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-glow z-0" />
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-md mx-auto px-4">
        <Reveal>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Crown className="text-[#FFD700]" size={32} />
              <span className="font-bold text-2xl tracking-tight">
                CLASH<span className="text-[#4717F6]">CAMPUS</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-gray-400">{subtitle}</p>
          </div>
        </Reveal>

        {children}
      </div>
    </div>
  );
}
