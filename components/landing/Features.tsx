'use client';

import { CheckCircle, Share2, Landmark } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import type { FeatureCard } from '@/types/landing';

/** Feature cards displayed in the Features section */
const FEATURES: FeatureCard[] = [
  {
    icon: CheckCircle,
    iconColor: 'text-[#4717F6]',
    iconBackground: 'bg-[#4717F6]/10',
    hoverBorder: 'hover:border-[#4717F6]/50',
    title: 'Verified Skill',
    description:
      'No more fake claims. We link directly to the API to verify trophies, win rates, and tournament standards. Your profile is your receipt.',
  },
  {
    icon: Share2,
    iconColor: 'text-[#FFD700]',
    iconBackground: 'bg-[#FFD700]/10',
    hoverBorder: 'hover:border-[#FFD700]/50',
    title: 'Shareable Player Cards',
    description:
      'Think "Spotify Wrapped" but for your battle log. Generate sleek, data-driven cards to flex your season performance on Instagram or Snap.',
  },
  {
    icon: Landmark,
    iconColor: 'text-white',
    iconBackground: 'bg-white/10',
    hoverBorder: 'hover:border-white/50',
    title: 'Campus Identity',
    description:
      "Rep your university. Every win contributes to your school's aggregate score. Help your campus climb the national university ladder.",
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
      className="py-24 bg-[#0D0D0D] relative overflow-hidden"
    >
      {/* Decorative Background Element */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-[#4717F6]/5 skew-x-12 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="mb-16">
            <span className="text-[#4717F6] font-bold tracking-widest uppercase text-sm">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2">
              More Than A Game. <br />
              This Is{' '}
              <span className="text-white border-b-4 border-[#4717F6]">
                Status.
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
  const Icon = feature.icon;
  const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : 'delay-200';

  return (
    <Reveal delay={delayClass}>
      <div
        className={`
          bg-card-gradient border border-gray-800 p-8 rounded-2xl
          transition-all duration-300 group ${feature.hoverBorder}
        `}
      >
        <div
          className={`
            w-12 h-12 ${feature.iconBackground} rounded-lg
            flex items-center justify-center mb-6
            group-hover:scale-110 transition-transform
          `}
        >
          <Icon className={feature.iconColor} size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
        <p className="text-gray-400 leading-relaxed">{feature.description}</p>
      </div>
    </Reveal>
  );
}

