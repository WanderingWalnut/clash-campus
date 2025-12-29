'use client';

import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import type { FeatureCard } from '@/types/landing';

/** Feature cards displayed in the Features section */
const FEATURES: FeatureCard[] = [
  {
    iconColor: 'text-[#003DA5]',
    iconBackground: 'bg-[#003DA5]/10',
    hoverBorder: 'hover:border-[#003DA5]/50',
    title: 'Verified Skill',
    description:
      'No more fake claims. We link directly to the API to verify trophies, win rates, and tournament standards. Your profile is your receipt.',
    gif: '/assets/stickers/Clash Royale Win Sticker by Clash Stars ES.gif',
  },
  {
    iconColor: 'text-[#FFD700]',
    iconBackground: 'bg-[#FFD700]/10',
    hoverBorder: 'hover:border-[#FFD700]/50',
    title: 'Climb the Ranks',
    description:
      'Climb the ranks and prove your competitive edge. Track your progress, dominate the leaderboards, and showcase your journey from rookie to legend.',
    gif: '/assets/stickers/plotting_goblin.gif',
  },
  {
    iconColor: 'text-white',
    iconBackground: 'bg-white/10',
    hoverBorder: 'hover:border-white/50',
    title: 'Campus Identity',
    description:
      "Rep your university. Every win contributes to your school's aggregate score. Help your campus climb the national university ladder.",
    gif: '/assets/stickers/67-meme-clash-royale.gif',
  },
];

/**
 * Features section showcasing the platform's key value propositions.
 * Displays three feature cards with icons and descriptions.
 */
export function Features() {
  return (
    <section
      id="features"
      className="py-12 md:py-24 bg-[#0F1B2E] relative overflow-hidden"
    >
      {/* Decorative Background Element */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-[#003DA5]/5 skew-x-12 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="mb-8 md:mb-16">
            <span className="text-[#003DA5] font-bold tracking-widest uppercase text-xs md:text-sm">
              Features
            </span>
            <h2 className="text-2xl md:text-5xl font-bold mt-1 md:mt-2">
              More Than A Game. <br />
              This Is{' '}
              <span className="text-white border-b-2 md:border-b-4 border-[#003DA5]">
                Status.
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {FEATURES.map((feature, index) => (
            <FeatureCardComponent
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardComponentProps {
  feature: FeatureCard;
  index: number;
}

/**
 * Individual feature card component.
 *
 * @param feature - The feature data to display (FeatureCard)
 * @param index - Index for staggered animation delay (number)
 */
function FeatureCardComponent({ feature, index }: FeatureCardComponentProps) {
  const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : 'delay-200';

  return (
    <Reveal delay={delayClass}>
      <div
        className={`
          bg-card-gradient border border-gray-800 p-4 md:p-8 rounded-xl md:rounded-2xl
          transition-all duration-300 group ${feature.hoverBorder}
          relative overflow-hidden
        `}
      >
        {/* GIF Icon */}
        {feature.gif && (
          <div
            className={`
              w-10 h-10 md:w-12 md:h-12 ${feature.iconBackground} rounded-lg
              flex items-center justify-center mb-4 md:mb-6
              group-hover:scale-110 transition-transform relative z-10
            `}
          >
            <Image
              src={feature.gif}
              alt=""
              width={48}
              height={48}
              className="w-full h-full object-contain"
              aria-hidden="true"
            />
          </div>
        )}
        <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 relative z-10">{feature.title}</h3>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed relative z-10">{feature.description}</p>
      </div>
    </Reveal>
  );
}
