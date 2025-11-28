'use client';

import { Crown, Trophy, Zap, Search, Medal } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Hero section of the landing page.
 * Features animated taglines, CTAs, and a floating player card preview.
 * This is the first impression users see when visiting ClashCampus.
 */
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
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
            A social status system for university players. Link your account,
            verify your campus, and compete for prestige. Skill is your new
            currency.
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal delay="delay-300">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button className="bg-[#4717F6] hover:bg-[#350ec9] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(71,23,246,0.5)] hover:shadow-[0_0_30px_rgba(71,23,246,0.7)] flex items-center justify-center gap-2">
              <Zap size={20} /> Claim Your Rank
            </button>
            <button className="glass hover:bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2">
              <Search size={20} /> Find My Campus
            </button>
          </div>
        </Reveal>

        {/* Floating Player Card Preview */}
        <HeroPlayerCard />
      </div>
    </section>
  );
}

/**
 * Floating player card component displayed in the hero section.
 * Shows a preview of what a player's profile card looks like.
 */
function HeroPlayerCard() {
  return (
    <div className="mt-16 w-full max-w-4xl relative perspective-1000">
      {/* Main Card */}
      <div className="relative z-20 bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-2xl animate-float mx-auto max-w-sm md:max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-orange-500 flex items-center justify-center font-bold text-black text-xs">
              K
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">KingSlayer_99</div>
              <div className="text-xs text-gray-400">Stanford University</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#FFD700]">
            <Trophy size={16} />
            <span className="font-bold">7,842</span>
          </div>
        </div>

        <div className="h-32 bg-gray-900 rounded-lg mb-4 flex items-center justify-center border border-gray-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#4717F6]/20 group-hover:bg-[#4717F6]/10 transition-colors" />
          <span className="relative z-10 text-sm font-mono text-[#FFD700] tracking-widest uppercase">
            Ultimate Champion
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500 uppercase">Win Rate</div>
            <div className="font-bold text-[#4717F6]">68%</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500 uppercase">Global</div>
            <div className="font-bold text-white">#402</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500 uppercase">Campus</div>
            <div className="font-bold text-[#FFD700]">#1</div>
          </div>
        </div>
      </div>

      {/* Floating Badge - Left */}
      <div className="hidden md:flex absolute top-1/2 -left-4 lg:-left-12 bg-black border border-[#FFD700]/30 rounded-xl p-3 items-center gap-3 shadow-xl transform -translate-y-1/2 -rotate-6 z-10">
        <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center">
          <Crown size={16} className="text-black" />
        </div>
        <div>
          <div className="text-xs text-gray-400">Current Status</div>
          <div className="text-sm font-bold text-white">Top 1% Campus</div>
        </div>
      </div>

      {/* Floating Badge - Right */}
      <div className="hidden md:flex absolute top-1/3 -right-4 lg:-right-12 bg-black border border-[#4717F6]/30 rounded-xl p-3 items-center gap-3 shadow-xl transform -translate-y-1/2 rotate-6 z-10">
        <div className="w-8 h-8 rounded-full bg-[#4717F6] flex items-center justify-center">
          <Medal size={16} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-gray-400">Win Streak</div>
          <div className="text-sm font-bold text-white">12 Games</div>
        </div>
      </div>
    </div>
  );
}

