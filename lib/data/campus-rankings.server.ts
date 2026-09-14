import 'server-only'

import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import type { RankedCampus } from '@/types/rankings'
import {
  CAMPUS_RANKINGS_CACHE_TAG,
  CAMPUS_RANKINGS_REVALIDATE_SECONDS,
} from './rankings-cache'

export const getCampusRankings = unstable_cache(
  async (limit: number): Promise<RankedCampus[]> => {
    const supabase = createPublicClient()
    const { data: rankings, error } = await supabase
      .from('university_rankings')
      .select(
        'average_ranking_score, player_count, rank, top_player, universities (name, short_code)'
      )
      .order('average_ranking_score', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return (rankings ?? []).map((row, index) => ({
      rank: row.rank ?? index + 1,
      name: row.universities?.name ?? 'Unknown University',
      short: row.universities?.short_code ?? 'N/A',
      avgScore: row.average_ranking_score,
      activePlayers: row.player_count,
      topPlayer: row.top_player ?? 'N/A',
      change: 'same' as const,
    }))
  },
  ['campus-rankings'],
  {
    tags: [CAMPUS_RANKINGS_CACHE_TAG],
    revalidate: CAMPUS_RANKINGS_REVALIDATE_SECONDS,
  }
)
