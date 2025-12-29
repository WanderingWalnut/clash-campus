'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Final call-to-action section encouraging users to connect their accounts.
 * Features a prominent headline and connection button.
 */
export function CallToAction() {
  return (
    <section className="pt-12 pb-28 md:pt-24 md:pb-24 relative overflow-hidden bg-[#0F1B2E]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-royale-pattern opacity-20" />
      <div className="absolute inset-0 bg-hero-glow opacity-30" />

      <Image
        src="/assets/images/hog_rider_think/image.png"
        alt=""
        width={360}
        height={360}
        className="pointer-events-none absolute bottom-0 right-2 w-24 sm:w-28 opacity-80 md:right-2 md:w-56 z-10"
        aria-hidden="true"
      />

      <Reveal>
        <div className="max-w-4xl mx-auto pl-6 pr-20 md:pl-4 md:pr-32 text-center relative z-10">
          <h2 className="text-3xl md:text-6xl font-extrabold mb-6 md:mb-6 tracking-tight">
            Stop Playing in Silence.
          </h2>
          <p className="text-base md:text-xl text-gray-300 mb-8 md:mb-10 leading-relaxed">
            Your trophies deserve an audience. Join the elite network of
            university Clash players.
          </p>
          <div className="flex flex-col items-center">
            <Link
              href="/signup"
              className="button-royale text-white px-6 py-3 md:px-10 md:py-5 rounded-lg font-bold text-base md:text-xl transition-transform duration-300 hover:-translate-y-0.5 inline-block"
            >
              Connect Account
            </Link>
            <p className="mt-3 md:mt-4 text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">
              Secure ID Verification
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
