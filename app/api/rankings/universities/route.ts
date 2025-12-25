import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100

// Revalidate public leaderboard data every 30 minutes
export const revalidate = 1800

function parseLimit(value: string | null) {
    if (!value) {
        return DEFAULT_LIMIT
    }

    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed) || parsed <= 0) {
        return DEFAULT_LIMIT
    }

    return Math.min(parsed, MAX_LIMIT)
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const limit = parseLimit(searchParams.get('limit'))

    // Public client avoids cookies, keeping this response cacheable.
    const supabase = createPublicClient()

    const { data: rankings, error } = await supabase
        .from('university_rankings')
        .select('average_ranking_score, player_count, rank, universities (name, short_code)')
        .order('average_ranking_score', { ascending: false })
        .limit(limit)

    if (error) {
        return NextResponse.json(
            { error: 'Failed to fetch university rankings' },
            { status: 500 }
        )
    }

    const campuses = (rankings ?? []).map((row, index) => ({
        rank: row.rank ?? index + 1,
        name: row.universities?.name ?? 'Unknown University',
        short: row.universities?.short_code ?? 'N/A',
        avgScore: row.average_ranking_score,
        activePlayers: row.player_count,
        topPlayer: 'N/A',
        change: 'same' as const,
    }))

    const response = NextResponse.json({
        campuses,
        limit,
    })

    // Cache at the CDN, allow background revalidation.
    response.headers.set(
        'Cache-Control',
        'public, max-age=0, s-maxage=1800, stale-while-revalidate=900'
    )

    return response
}
