'use client';

import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Roadmap section displaying the product development timeline.
 * Shows current phase and upcoming features.
 */
export function Roadmap() {
  return (
    <section
      id="roadmap"
      className="py-12 md:py-24 bg-[#0A1628] border-t border-gray-900 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12">
            The Battle Plan
          </h2>
        </Reveal>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gray-800" />

          {/* Phase 1 - Live */}
          <Reveal>
            <div className="relative z-10 mb-8 md:mb-12">
              <div className="bg-[#003DA5] text-white text-[10px] md:text-xs font-bold px-2.5 py-0.5 md:px-3 md:py-1 rounded-full inline-block mb-3 md:mb-4">
                LIVE NOW
              </div>
              <div className="bg-[#1A2332] border border-gray-700 p-4 md:p-6 rounded-xl max-w-md mx-auto relative">
                <Image
                  src="/assets/stickers/Clash Royale Sticker Sticker by Clash Stars ES (2).gif"
                  alt=""
                  width={100}
                  height={100}
                  className="pointer-events-none absolute -right-8 md:-right-12 top-1/2 -translate-y-1/2 w-16 md:w-24 h-auto opacity-70 hidden md:block"
                  aria-hidden="true"
                />
                <h3 className="text-lg md:text-xl font-bold text-white">
                  Phase 1: Individual Glory
                </h3>
                <p className="text-gray-400 text-xs md:text-sm mt-1.5 md:mt-2">
                  Establish the rankings. Verify players. Build the individual
                  status profiles.
                </p>
                {/* Arrow Pointer */}
                <div className="absolute left-1/2 -bottom-3 w-4 h-4 bg-[#1A2332] border-b border-r border-gray-700 transform rotate-45 -translate-x-1/2" />
              </div>
            </div>
          </Reveal>

          {/* Phase 2 - Coming Soon */}
          <Reveal delay="delay-200">
            <div className="relative z-10">
              <div className="bg-[#FFD700] text-black text-[10px] md:text-xs font-bold px-2.5 py-0.5 md:px-3 md:py-1 rounded-full inline-block mb-3 md:mb-4">
                COMING SOON
              </div>
              <div className="glass border border-[#FFD700]/30 p-4 md:p-6 rounded-xl max-w-md mx-auto shadow-[0_0_30px_rgba(255,215,0,0.05)] relative">
                <Image
                  src="/assets/stickers/Clash Royale Sticker Sticker by Clash Stars ES (2).gif"
                  alt=""
                  width={100}
                  height={100}
                  className="pointer-events-none absolute -left-8 md:-left-12 top-1/2 -translate-y-1/2 w-16 md:w-24 h-auto opacity-70 hidden md:block"
                  aria-hidden="true"
                />
                <h3 className="text-lg md:text-xl font-bold text-[#FFD700]">
                  Phase 2: Campus Showdown
                </h3>
                <p className="text-gray-300 text-xs md:text-sm mt-1.5 md:mt-2">
                  University vs. University wars. The top players from each campus
                  compete head-to-head in custom tournament brackets. Represent your
                  school and battle for campus supremacy.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
