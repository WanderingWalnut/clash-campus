import {
  Hero,
  RoyaleRankings,
  Features,
  Roadmap,
  CallToAction,
  Footer,
} from '@/components/landing';

/**
 * ClashCampus Landing Page
 *
 * The main entry point for ClashCampus. Displays the marketing landing page
 * with hero section, leaderboard preview, features, roadmap, and CTAs.
 *
 * @returns The complete landing page composed of modular sections
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Hero />
      <RoyaleRankings />
      <Features />
      <Roadmap />
      <CallToAction />
      <Footer />
    </div>
  );
}
