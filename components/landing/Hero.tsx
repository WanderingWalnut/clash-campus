import Image from 'next/image';
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
      <div className="absolute inset-0 z-0 bg-royale-pattern opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Launch Badge */}
        <Reveal>
          <div className="mb-3 md:mb-6 inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-[#003DA5]/30 bg-[#003DA5]/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#003DA5] animate-pulse" />
            <span className="text-[#003DA5] text-xs font-bold tracking-widest uppercase">
              The Arena Just Moved to Campus
            </span>
          </div>
        </Reveal>

        {/* Main Headline */}
        <Reveal delay="delay-100">
          <h1 className="text-3xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-3 md:mb-6 leading-tight">
            Where Clash <br />
            Becomes <span className="text-gradient-gold">Culture</span>.
          </h1>
        </Reveal>

        {/* Subheadline */}
        <Reveal delay="delay-200">
          <p className="max-w-2xl text-base md:text-xl text-gray-400 mb-6 md:mb-10 font-light leading-relaxed mx-auto">
            Every campus has a king or queen. Link your account, verify your
            campus, and rise to power. Skill is your new currency.
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal delay="delay-300">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full justify-center">
            <Link
              href="/signup"
              className="button-royale text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-base md:text-lg transition-transform duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Zap size={20} /> Claim Your Rank
            </Link>
            <Link
              href="/rankings"
              className="glass hover:bg-white/10 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2">
              <Search size={20} /> Find My Campus </Link>
          </div>
        </Reveal>

        {/* Floating Player Card Preview */}
        <HeroPlayerCard />
      </div>

      <Reveal delay="delay-500">
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <Image
            src="/assets/stickers/swipe up.gif"
            alt="Scroll indicator"
            width={120}
            height={120}
            className="w-16 md:w-20 h-auto opacity-80"
          />
        </div>
      </Reveal>
    </HeroSectionWrapper>
  );
}
