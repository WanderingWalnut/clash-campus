import type { Metadata } from 'next';
import { RankingsHero, RankingsTable, RankingsCTA } from '@/components/rankings';
import { Footer } from '@/components/landing';

/**
 * Metadata for the Rankings page (SEO).
 */
export const metadata: Metadata = {
  title: 'Royale Rankings | ClashCampus',
  description:
    'View the official Clash Royale rankings for university players. See who dominates at your campus and how universities stack up against each other.',
  openGraph: {
    title: 'Royale Rankings | ClashCampus',
    description:
      'View the official Clash Royale rankings for university players.',
  },
};

/**
 * Royale Rankings Page
 *
 * Displays the full leaderboard with player and campus rankings.
 * Users can toggle between individual player rankings and university rankings.
 *
 * @returns The complete rankings page with hero, tables, and CTA
 */
export default function RankingsPage() {
  return (
    <div className="pt-28 min-h-screen bg-[#0D0D0D]">
      <RankingsHero />
      <RankingsTable />
      <RankingsCTA />
      <Footer />
    </div>
  );
}
