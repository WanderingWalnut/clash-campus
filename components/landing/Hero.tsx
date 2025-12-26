import Link from 'next/link';
import { Zap, Search } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { HeroSectionWrapper } from './HeroSectionWrapper';
import { HeroPlayerCard } from './HeroPlayerCard';

/**
 * Hero section of the landing page.
 * Features animated taglines, CTAs, and a floating player card preview.
 * This is the first impression users see when visiting ClashCampus.
 * 
 * Most of this component is server-side. Only the scroll-dependent padding
 * is handled by a small client component wrapper.
 */
export function Hero() {
  return (
    <HeroSectionWrapper>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Launch Badge */}
        <Reveal>
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#4717F6]/30 bg-[#4717F6]/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#4717F6] animate-pulse" />
            <span className="text-[#4717F6] text-xs font-bold tracking-widest uppercase">
              The Arena Just Moved to Campus
            </span>
          </div>
        </Reveal>

        {/* Main Headline */}
        <Reveal delay="delay-100">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-tight">
            Where Clash <br />
            Becomes <span className="text-gradient-gold">Culture</span>.
          </h1>
        </Reveal>

        {/* Subheadline */}
        <Reveal delay="delay-200">
          <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-10 font-light leading-relaxed mx-auto">
            Every campus has a king or queen. Link your account, verify your
            campus, and rise to power. Skill is your new currency.
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal delay="delay-300">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              href="/signup"
              className="bg-[#4717F6] hover:bg-[#350ec9] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(71,23,246,0.5)] hover:shadow-[0_0_30px_rgba(71,23,246,0.7)] flex items-center justify-center gap-2"
            >
              <Zap size={20} /> Claim Your Rank
            </Link>
            <Link
              href="/rankings"
              className="glass hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2">
              <Search size={20} /> Find My Campus </Link>
          </div>
        </Reveal>

        {/* Floating Player Card Preview */}
        <HeroPlayerCard />
      </div>
    </HeroSectionWrapper>
  );
}
