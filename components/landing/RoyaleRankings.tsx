import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import { createPublicClient } from '@/lib/supabase/public';
import { Reveal } from '@/components/ui/Reveal';
import { CampusesPreviewTable } from './CampusesPreviewTable';
import type { RankedCampus } from '@/types/rankings';

const PREVIEW_LIMIT = 3;
const PREVIEW_REVALIDATE_SECONDS = 30 * 60;

const getCampusPreview = unstable_cache(
  async (): Promise<RankedCampus[]> => {
    const supabase = createPublicClient();
    const { data: rankings, error } = await supabase
      .from('university_rankings')
      .select(
        'average_ranking_score, player_count, rank, top_player, universities (name, short_code)'
      )
      .order('average_ranking_score', { ascending: false })
      .limit(PREVIEW_LIMIT);

    if (error) {
      throw error;
    }

    return (rankings ?? []).map((row, index) => ({
      rank: row.rank ?? index + 1,
      name: row.universities?.name ?? 'Unknown University',
      short: row.universities?.short_code ?? 'N/A',
      avgScore: row.average_ranking_score,
      activePlayers: row.player_count,
      topPlayer: row.top_player ?? 'N/A',
      change: 'same' as const,
    }));
  },
  ['landing-campus-preview-v1'],
  { revalidate: PREVIEW_REVALIDATE_SECONDS }
);

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
          <Suspense fallback={<CampusRankingsPreviewFallback />}>
            <CampusRankingsPreview />
          </Suspense>
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

function CampusRankingsPreviewFallback() {
  return (
    <div className="bg-[#1B2637] border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400">
      Loading university rankings...
    </div>
  );
}

async function CampusRankingsPreview() {
  let campuses: RankedCampus[] = [];
  let errorMessage: string | null = null;

  try {
    campuses = await getCampusPreview();
  } catch {
    errorMessage = 'Unable to load university rankings right now.';
  }

  if (errorMessage) {
    return (
      <div className="bg-[#1B2637] border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400">
        {errorMessage}
      </div>
    );
  }

  if (campuses.length === 0) {
    return (
      <div className="bg-[#1B2637] border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400">
        No university rankings yet. Check back soon.
      </div>
    );
  }

  return <CampusesPreviewTable campuses={campuses} />;
}
