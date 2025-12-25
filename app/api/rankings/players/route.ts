import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

function parsePage(value: string | null) {
    if (!value) {
        return DEFAULT_PAGE
    }

    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed) || parsed <= 0) {
        return DEFAULT_PAGE
    }

    return parsed
}

function parsePageSize(value: string | null) {
    if (!value) {
        return DEFAULT_PAGE_SIZE
    }

    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed) || parsed <= 0) {
        return DEFAULT_PAGE_SIZE
    }

    return Math.min(parsed, MAX_PAGE_SIZE)
}

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        )
    }

    const userId = authData.user.id
    // Scope rankings to the user's university for privacy + performance.
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('university_id')
        .eq('id', userId)
        .maybeSingle()

    if (profileError || !profile?.university_id) {
        return NextResponse.json(
            { error: 'User profile missing university association' },
            { status: 403 }
        )
    }

    const { searchParams } = new URL(request.url)
    const page = parsePage(searchParams.get('page'))
    const pageSize = parsePageSize(searchParams.get('pageSize'))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: rows, error, count } = await supabase
        .from('player_rankings')
        .select(
            'ranking_score, current_trophies, wins, pol_current_league, pol_best_league, clash_accounts!inner(name, player_tag, profile_id), universities (name, short_code)',
            { count: 'exact' }
        )
        .eq('university_id', profile.university_id)
        .order('ranking_score', { ascending: false })
        .order('current_trophies', { ascending: false })
        .order('wins', { ascending: false })
        .range(from, to)

    if (error) {
        return NextResponse.json(
            { error: 'Failed to fetch player rankings' },
            { status: 500 }
        )
    }

    const players = (rows ?? []).map((row, index) => ({
        rank: from + index + 1,
        name: row.clash_accounts?.name ?? 'Unknown Player',
        tag: row.clash_accounts?.player_tag ?? '',
        university: row.universities?.name ?? 'Unknown University',
        universityShort: row.universities?.short_code ?? 'N/A',
        score: row.ranking_score,
        trophies: row.current_trophies,
        wins: row.wins,
        polCurrentLeague: row.pol_current_league ?? 0,
        polBestLeague: row.pol_best_league ?? 0,
        change: 'same' as const,
        isUser: row.clash_accounts?.profile_id === userId,
    }))

    const userInPage = players.some((player) => player.isUser)

    let userEntry: typeof players[number] | null = null
    if (!userInPage) {
        // Fetch the user's row so we can show their rank even off-page.
        const { data: userRow, error: userRowError } = await supabase
            .from('player_rankings')
            .select(
                'ranking_score, current_trophies, wins, pol_current_league, pol_best_league, clash_accounts!inner(name, player_tag, profile_id), universities (name, short_code)'
            )
            .eq('clash_accounts.profile_id', userId)
            .eq('university_id', profile.university_id)
            .maybeSingle()

        if (!userRowError && userRow) {
            const { count: higherCount } = await supabase
                .from('player_rankings')
                .select('id', { count: 'exact', head: true })
                .eq('university_id', profile.university_id)
                .gt('ranking_score', userRow.ranking_score)

            userEntry = {
                rank: (higherCount ?? 0) + 1,
                name: userRow.clash_accounts?.name ?? 'Unknown Player',
                tag: userRow.clash_accounts?.player_tag ?? '',
                university: userRow.universities?.name ?? 'Unknown University',
                universityShort: userRow.universities?.short_code ?? 'N/A',
                score: userRow.ranking_score,
                trophies: userRow.current_trophies,
                wins: userRow.wins,
                polCurrentLeague: userRow.pol_current_league ?? 0,
                polBestLeague: userRow.pol_best_league ?? 0,
                change: 'same',
                isUser: true,
            }
        }
    }

    const response = NextResponse.json({
        players,
        user: userEntry,
        page,
        pageSize,
        total: count ?? players.length,
    })

    response.headers.set(
        'Cache-Control',
        'private, max-age=0, s-maxage=1800, stale-while-revalidate=900'
    )

    return response
}
