import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { RankingsHero } from '@/components/rankings';
import { Footer } from '@/components/landing';
import { getAuthenticatedUser } from '@/lib/auth/session.server';
import { getVerificationStatus } from '@/lib/auth/verification.server';
import type { PlayerRankingsAccess } from '@/types/rankings';

/**
 * Metadata for the Rankings page (SEO).
 */
export const metadata: Metadata = {
  title: 'Royale Rankings | ClashCampus',
  description:
    'View Clash Royale rankings for university players. See who dominates at your campus and how universities stack up against each other.',
  openGraph: {
    title: 'Royale Rankings | ClashCampus',
    description: 'View Clash Royale rankings for university players.',
  },
};

const RankingsClient = dynamic(
  () =>
    import('@/components/rankings/RankingsClient').then(
      (mod) => mod.RankingsClient
    ),
  {
    loading: () => (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#1B2637] border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400">
          Loading rankings...
        </div>
      </div>
    ),
  }
);

/**
 * Royale Rankings Page
 *
 * Displays the full leaderboard with player and campus rankings.
 * Users can toggle between individual player rankings and university rankings.
 *
 * @returns The complete rankings page with hero, tables, and CTA
 */
export default async function RankingsPage() {
  const { user } = await getAuthenticatedUser();
  let playerAccess: PlayerRankingsAccess = 'signed-out';

  if (user) {
    const status = await getVerificationStatus(user.id);
    playerAccess = status.isVerified ? 'allowed' : 'verification-required';
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F1B2E] pt-28">
      <div className="flex-1">
        <RankingsHero />
        <RankingsClient playerAccess={playerAccess} />
      </div>
      <Footer />
    </div>
  );
}
