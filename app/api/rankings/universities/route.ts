import { NextResponse } from 'next/server'
import { getCampusRankings } from '@/lib/data/campus-rankings.server'
import { CAMPUS_RANKINGS_REVALIDATE_SECONDS } from '@/lib/data/rankings-cache'

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

    let campuses
    try {
        campuses = await getCampusRankings(limit)
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch university rankings' },
            { status: 500 }
        )
    }

    const response = NextResponse.json({
        campuses,
        limit,
    })

    // Cache at the CDN, allow background revalidation.
    response.headers.set(
        'Cache-Control',
        `public, max-age=0, s-maxage=${CAMPUS_RANKINGS_REVALIDATE_SECONDS}, stale-while-revalidate=900`
    )

    return response
}
