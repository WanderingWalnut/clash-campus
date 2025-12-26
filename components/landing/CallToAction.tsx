'use client';

import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Final call-to-action section encouraging users to connect their accounts.
 * Features a prominent headline and connection button.
 */
export function CallToAction() {
  return (
    <section className="py-12 md:py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[#4717F6] opacity-10" />

      <Reveal>
        <div className="max-w-4xl mx-auto px-3 md:px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 tracking-tight">
            Stop Playing in Silence.
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-10">
            Your trophies deserve an audience. Join the elite network of
            university Clash players.
          </p>
          <div className="flex flex-col items-center">
            <Link
              href="/signup"
              className="bg-white text-black hover:bg-[#FFD700] px-6 py-3 md:px-10 md:py-5 rounded-full font-bold text-base md:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl inline-block"
            >
              Connect Account
            </Link>
            <p className="mt-3 md:mt-4 text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">
              Secure Supercell ID Verification
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

