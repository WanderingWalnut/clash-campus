'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CampusesTable } from '@/components/rankings/CampusesTable';
import {
  EmptyPanel,
  ErrorPanel,
  LoadingPanel,
} from '@/components/rankings/RankingsPanels';
import { Reveal } from '@/components/ui/Reveal';
import { useCampusRankings } from '@/hooks/useRankingsData';

const PREVIEW_LIMIT = 3;

/**
 * Royale Rankings section displaying a preview of the university leaderboard.
 * Shows top 3 universities with their stats and links to the full rankings page.
 */
export function RoyaleRankings() {
  return (
    <section id="rankings" className="py-12 md:py-24 bg-[#1B2637] relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4">
              Royale <span className="text-[#FFD700]">Rankings</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
              Your leaderboard. Your reputation. See who actually runs the arena
              at your university.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <CampusRankingsPreview />
        </Reveal>

        <div className="mt-6 md:mt-8 text-center">
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 text-[#003DA5] hover:text-white transition-colors text-xs md:text-sm font-bold uppercase tracking-widest"
          >
            View Full Leaderboard <ArrowRight size={14} className="md:w-4 md:h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CampusRankingsPreview() {
  const { campuses, error, isLoading } = useCampusRankings({
    initialLimit: PREVIEW_LIMIT,
    pageSize: PREVIEW_LIMIT,
  });
  const previewCampuses = campuses.slice(0, PREVIEW_LIMIT);
  const isInitialLoading = isLoading && previewCampuses.length === 0;

  if (isInitialLoading) {
    return <LoadingPanel message="Loading university rankings..." />;
  }

  if (error && previewCampuses.length === 0) {
    return <ErrorPanel message={error} />;
  }

  if (previewCampuses.length === 0) {
    return (
      <EmptyPanel message="No university rankings yet. Check back soon." />
    );
  }

  return (
    <CampusesTable
      campuses={previewCampuses}
      hasMore={false}
      onShowMore={() => {}}
    />
  );
}
