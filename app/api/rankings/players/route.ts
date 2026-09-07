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
    // These independent checks run together. RLS remains the final data boundary.
    const [profileResult, clashAccountResult] = await Promise.all([
        supabase
            .from('profiles')
            .select('university_id')
            .eq('id', userId)
            .maybeSingle(),
        supabase
            .from('clash_accounts')
            .select('verified')
            .eq('profile_id', userId)
            .maybeSingle(),
    ])
    const { data: profile, error: profileError } = profileResult
    const { data: clashAccount, error: clashAccountError } = clashAccountResult

    if (clashAccountError || clashAccount?.verified !== true) {
        return NextResponse.json(
            { error: 'Verified Clash account required' },
            { status: 403 }
        )
    }

    if (profileError || !profile?.university_id) {
        return NextResponse.json(
            { error: 'User profile missing university association' },
            { status: 403 }
        )
    }

    const { searchParams } = new URL(request.url)
    const page = parsePage(searchParams.get('page'))
    const pageSize = parsePageSize(searchParams.get('pageSize'))
    const offset = (page - 1) * pageSize

    // Use enhanced RPC function that returns players, user entry, and total count
    // This reduces queries from 7 to 2 (profile query + RPC call)
    const { data: result, error } = await supabase.rpc('get_ranked_players_complete', {
        p_university_id: profile.university_id,
        p_user_id: userId,
        p_limit: pageSize,
        p_offset: offset,
    })

    if (error) {
        return NextResponse.json(
            { error: 'Failed to fetch player rankings' },
            { status: 500 }
        )
    }

    // Parse JSONB response from RPC
    // Result structure: { players: [...], user: {...} | null, total: number }
    type RankedPlayerResponse = {
        rank: number
        name: string
        tag: string
        university: string
        universityShort: string
        score: number
        trophies: number
        wins: number
        polCurrentLeague: number
        polBestLeague: number
        change: 'same'
        isUser: boolean
    }

    type RpcResponse = {
        players: RankedPlayerResponse[]
        user: RankedPlayerResponse | null
        total: number
    }

    const rpcResult = result as unknown as RpcResponse | null
    const players = rpcResult?.players ?? []
    const userEntry = rpcResult?.user ?? null
    const total = rpcResult?.total ?? 0

    const response = NextResponse.json({
        players,
        user: userEntry,
        page,
        pageSize,
        total,
    })

    response.headers.set(
        'Cache-Control',
        'private, no-store'
    )

    return response
}
