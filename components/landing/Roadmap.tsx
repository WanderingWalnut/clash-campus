'use client';

import { Reveal } from '@/components/ui/Reveal';

/**
 * Roadmap section displaying the product development timeline.
 * Shows current phase and upcoming features.
 */
export function Roadmap() {
  return (
    <section
      id="roadmap"
      className="py-24 bg-[#0A0A0A] border-t border-gray-900"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            The Battle Plan
          </h2>
        </Reveal>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gray-800" />

          {/* Phase 1 - Live */}
          <Reveal>
            <div className="relative z-10 mb-12">
              <div className="bg-[#4717F6] text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                LIVE NOW
              </div>
              <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl max-w-md mx-auto relative">
                <h3 className="text-xl font-bold text-white">
                  Phase 1: Individual Glory
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  Establish the rankings. Verify players. Build the individual
                  status profiles.
                </p>
                {/* Arrow Pointer */}
                <div className="absolute left-1/2 -bottom-3 w-4 h-4 bg-gray-900 border-b border-r border-gray-700 transform rotate-45 -translate-x-1/2" />
              </div>
            </div>
          </Reveal>

          {/* Phase 2 - Coming Soon */}
          <Reveal delay="delay-200">
            <div className="relative z-10">
              <div className="bg-[#FFD700] text-black text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                COMING SOON
              </div>
              <div className="glass border border-[#FFD700]/30 p-6 rounded-xl max-w-md mx-auto shadow-[0_0_30px_rgba(255,215,0,0.05)]">
                <h3 className="text-xl font-bold text-[#FFD700]">
                  Phase 2: Campus Showdown
                </h3>
                <p className="text-gray-300 text-sm mt-2">
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

