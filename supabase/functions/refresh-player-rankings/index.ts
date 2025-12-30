import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1'

type ClashRoyalePlayer = {
  tag: string
  name: string
  trophies: number
  bestTrophies: number
  wins: number
  losses: number
  threeCrownWins: number
  leagueStatistics?: {
    currentSeason?: {
      leagueNumber?: number
    }
    bestSeason?: {
      leagueNumber?: number
    }
  }
}

type PlayerRankingRow = {
  id: string
  refresh_attempts: number | null
  next_refresh_at: string | null
  university_id: string
  clash_accounts: {
    id: string
    player_tag: string | null
    name: string | null
  } | null
}

type TopPlayerRow = {
  clash_accounts: {
    name: string | null
  } | null
}

const SCORE_VERSION = 'v1'
const MAX_TROPHIES = 10000
const MAX_POL_LEAGUE = 10

const DEFAULT_BATCH_SIZE = 25
const DEFAULT_REFRESH_INTERVAL_MINUTES = 30
const DEFAULT_RATE_LIMIT_DELAY_MS = 250

const RATE_LIMIT_BACKOFF_MINUTES = [60, 360, 1440, 1440]
const SERVER_BACKOFF_MINUTES = [15, 60, 360, 1440]
const CLIENT_BACKOFF_MINUTES = [10080]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function calculateRankingScore(player: ClashRoyalePlayer) {
  const trophies = player.trophies ?? 0
  const wins = player.wins ?? 0
  const losses = player.losses ?? 0
  const threeCrownWins = player.threeCrownWins ?? 0

  const polCurrentLeague = clamp(
    player.leagueStatistics?.currentSeason?.leagueNumber ?? 0,
    0,
    MAX_POL_LEAGUE
  )
  const polBestLeague = clamp(
    player.leagueStatistics?.bestSeason?.leagueNumber ?? 0,
    0,
    MAX_POL_LEAGUE
  )

  const totalBattles = wins + losses
  const winRate = totalBattles > 0 ? wins / totalBattles : 0
  const threeCrownRate = wins > 0 ? threeCrownWins / wins : 0

  const trophiesScore = clamp(trophies / MAX_TROPHIES, 0, 1)
  const polCurrentScore = clamp(polCurrentLeague / MAX_POL_LEAGUE, 0, 1)
  const polBestScore = clamp(polBestLeague / MAX_POL_LEAGUE, 0, 1)

  const rawScore =
    55 * trophiesScore
    + 30 * polCurrentScore
    + 5 * polBestScore
    + 5 * winRate
    + 5 * threeCrownRate

  // Ensure exactly 2 decimal places for database insertion
  const rankingScore = parseFloat(rawScore.toFixed(2))

  return {
    rankingScore,
    rawScore,
    polCurrentLeague,
    polBestLeague,
    winRate,
    threeCrownRate,
  }
}

function getBackoffMinutes(attempts: number, kind: 'rate_limit' | 'server' | 'client') {
  const table = kind === 'rate_limit'
    ? RATE_LIMIT_BACKOFF_MINUTES
    : kind === 'server'
      ? SERVER_BACKOFF_MINUTES
      : CLIENT_BACKOFF_MINUTES

  const index = Math.min(Math.max(attempts - 1, 0), table.length - 1)
  return table[index]
}

async function sleep(ms: number) {
  if (ms <= 0) return
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchPlayer(playerTag: string, apiKey: string) {
  const normalizedTag = playerTag.startsWith('#') ? playerTag : `#${playerTag}`
  const encodedTag = encodeURIComponent(normalizedTag)
  const url = `https://proxy.royaleapi.dev/v1/players/${encodedTag}`

  console.log(`[fetchPlayer] Fetching player: ${normalizedTag}`, {
    encodedTag,
    url,
  })

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error(`[fetchPlayer] API error for ${normalizedTag}`, {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200),
      })
      return {
        ok: false as const,
        status: response.status,
        message: `Clash Royale API error ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json() as ClashRoyalePlayer
    console.log(`[fetchPlayer] Success for ${normalizedTag}`, {
      name: data.name,
      trophies: data.trophies,
      wins: data.wins,
      losses: data.losses,
    })
    return { ok: true as const, data }
  } catch (error) {
    console.error(`[fetchPlayer] Exception for ${normalizedTag}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return {
      ok: false as const,
      status: null,
      message: error instanceof Error ? error.message : 'Unknown fetch error',
    }
  }
}

async function updateUniversityTopPlayer(
  supabase: ReturnType<typeof createClient>,
  universityId: string
) {
  const { data: topPlayer, error: topPlayerError } = await supabase
    .from('player_rankings')
    .select('ranking_score, current_trophies, wins, clash_accounts ( name )')
    .eq('university_id', universityId)
    .order('ranking_score', { ascending: false })
    .order('current_trophies', { ascending: false })
    .order('wins', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (topPlayerError) {
    console.error('[top-player] Failed to load top player', {
      universityId,
      error: topPlayerError.message,
      code: topPlayerError.code,
      details: topPlayerError.details,
    })
    return false
  }

  const topPlayerName = (topPlayer as TopPlayerRow | null)?.clash_accounts?.name ?? null

  const { error: updateError } = await supabase
    .from('university_rankings')
    .update({ top_player: topPlayerName })
    .eq('university_id', universityId)

  if (updateError) {
    console.error('[top-player] Failed to update university rankings', {
      universityId,
      error: updateError.message,
      code: updateError.code,
      details: updateError.details,
    })
    return false
  }

  console.log('[top-player] Updated campus captain', {
    universityId,
    topPlayerName,
  })

  return true
}

Deno.serve(async () => {
  const startTime = Date.now()
  console.log('='.repeat(80))
  console.log('[refresh-player-rankings] Function started')
  console.log('='.repeat(80))

  // Environment variable checks
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
    ?? Deno.env.get('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const clashApiKey = Deno.env.get('CLASH_ROYALE_API_KEY')

  console.log('[env] Environment variables check:', {
    hasSupabaseUrl: !!supabaseUrl,
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    hasServiceRoleKey: !!serviceRoleKey,
    serviceRoleKeyLength: serviceRoleKey?.length ?? 0,
    hasClashApiKey: !!clashApiKey,
    clashApiKeyLength: clashApiKey?.length ?? 0,
    clashApiKeyPrefix: clashApiKey ? `${clashApiKey.substring(0, 10)}...` : 'MISSING',
  })

  if (!supabaseUrl || !serviceRoleKey || !clashApiKey) {
    const missing = []
    if (!supabaseUrl) missing.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    if (!clashApiKey) missing.push('CLASH_ROYALE_API_KEY')

    console.error('[env] Missing required environment variables:', { missing })
    return new Response(
      JSON.stringify({
        error: 'Missing environment configuration',
        missing,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const batchSize = Number(Deno.env.get('PLAYER_RANKINGS_REFRESH_BATCH_SIZE') ?? DEFAULT_BATCH_SIZE)
  const refreshIntervalMinutes = Number(
    Deno.env.get('PLAYER_RANKINGS_REFRESH_MINUTES') ?? DEFAULT_REFRESH_INTERVAL_MINUTES
  )
  const rateLimitDelayMs = Number(
    Deno.env.get('PLAYER_RANKINGS_RATE_LIMIT_DELAY_MS') ?? DEFAULT_RATE_LIMIT_DELAY_MS
  )

  console.log('[config] Configuration values:', {
    batchSize,
    refreshIntervalMinutes,
    rateLimitDelayMs,
  })

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const now = new Date()
  const nowIso = now.toISOString()

  console.log('[query] Querying due player rankings', {
    now: nowIso,
    condition: 'next_refresh_at <= now()',
    batchSize,
  })

  // First, check total count of player_rankings
  const { count: totalCount, error: countError } = await supabase
    .from('player_rankings')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('[query] Failed to count total player_rankings', {
      error: countError.message,
      code: countError.code,
      details: countError.details,
    })
  } else {
    console.log('[query] Total player_rankings rows:', totalCount ?? 0)
  }

  // Check how many have next_refresh_at set
  const { count: withRefreshAt, error: refreshAtCountError } = await supabase
    .from('player_rankings')
    .select('*', { count: 'exact', head: true })
    .not('next_refresh_at', 'is', null)

  if (refreshAtCountError) {
    console.error('[query] Failed to count rows with next_refresh_at', {
      error: refreshAtCountError.message,
    })
  } else {
    console.log('[query] Rows with next_refresh_at set:', withRefreshAt ?? 0)
  }

  // Check how many are due (next_refresh_at <= now)
  const { count: dueCount, error: dueCountError } = await supabase
    .from('player_rankings')
    .select('*', { count: 'exact', head: true })
    .lte('next_refresh_at', nowIso)

  if (dueCountError) {
    console.error('[query] Failed to count due player_rankings', {
      error: dueCountError.message,
    })
  } else {
    console.log('[query] Rows due for refresh (next_refresh_at <= now):', dueCount ?? 0)
  }

  // Sample a few rows to see their next_refresh_at values
  const { data: sampleRows, error: sampleError } = await supabase
    .from('player_rankings')
    .select('id, next_refresh_at, refresh_attempts, last_synced_at')
    .order('next_refresh_at', { ascending: true, nullsFirst: true })
    .limit(5)

  if (sampleError) {
    console.error('[query] Failed to sample player_rankings', {
      error: sampleError.message,
    })
  } else {
    console.log('[query] Sample rows (first 5):',
      sampleRows?.map(r => ({
        id: r.id.substring(0, 8) + '...',
        next_refresh_at: r.next_refresh_at,
        refresh_attempts: r.refresh_attempts,
        last_synced_at: r.last_synced_at,
        isDue: r.next_refresh_at ? new Date(r.next_refresh_at) <= now : false,
      }))
    )
  }

  // Now fetch the actual due players
  const { data: duePlayers, error } = await supabase
    .from('player_rankings')
    .select('id, refresh_attempts, next_refresh_at, university_id, clash_accounts ( id, player_tag, name )')
    .lte('next_refresh_at', nowIso)
    .order('next_refresh_at', { ascending: true })
    .limit(batchSize)

  if (error) {
    console.error('[query] Failed to load due player rankings', {
      error: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return new Response(
      JSON.stringify({
        error: 'Failed to query due player rankings',
        message: error.message,
        code: error.code,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  console.log('[query] Due players found:', {
    count: duePlayers?.length ?? 0,
    batchSize,
  })

  if (!duePlayers || duePlayers.length === 0) {
    const response = {
      processed: 0,
      updated: 0,
      failed: 0,
      summary: {
        totalRows: totalCount ?? 0,
        rowsWithRefreshAt: withRefreshAt ?? 0,
        rowsDue: dueCount ?? 0,
        sampleRows: sampleRows?.length ?? 0,
      },
    }
    console.log('[result] No players due for refresh', response)
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.log('[process] Processing players:', {
    count: duePlayers.length,
    playerIds: duePlayers.map(p => p.id.substring(0, 8) + '...'),
  })

  let updated = 0
  let failed = 0
  let topPlayerUpdated = 0
  let topPlayerFailed = 0
  const universitiesToUpdate = new Set<string>()

  for (let i = 0; i < duePlayers.length; i++) {
    const row = duePlayers[i] as PlayerRankingRow
    const attempts = row.refresh_attempts ?? 0
    const nextAttempts = attempts + 1
    const playerTag = row.clash_accounts?.player_tag

    console.log(`[process] Processing player ${i + 1}/${duePlayers.length}`, {
      id: row.id.substring(0, 8) + '...',
      playerTag: playerTag || 'MISSING',
      attempts,
      nextRefreshAt: row.next_refresh_at,
    })

    if (!playerTag) {
      const backoffMinutes = getBackoffMinutes(nextAttempts, 'client')
      const nextRefreshAt = new Date(Date.now() + backoffMinutes * 60 * 1000)

      console.warn(`[process] Missing player tag for row ${row.id}`, {
        id: row.id,
        backoffMinutes,
        nextRefreshAt: nextRefreshAt.toISOString(),
      })

      const { error: updateError } = await supabase
        .from('player_rankings')
        .update({
          refresh_attempts: nextAttempts,
          next_refresh_at: nextRefreshAt.toISOString(),
          last_error: 'Missing player tag for refresh',
        })
        .eq('id', row.id)

      if (updateError) {
        console.error(`[process] Failed to update row ${row.id}`, {
          error: updateError.message,
        })
      }

      failed += 1
      continue
    }

    const playerResult = await fetchPlayer(playerTag, clashApiKey)

    if (!playerResult.ok) {
      const status = playerResult.status
      const backoffKind = status === 429
        ? 'rate_limit'
        : status && status >= 500
          ? 'server'
          : status && status >= 400
            ? 'client'
            : 'server'

      const backoffMinutes = getBackoffMinutes(nextAttempts, backoffKind)
      const nextRefreshAt = new Date(Date.now() + backoffMinutes * 60 * 1000)

      console.error(`[process] Failed to fetch player ${playerTag}`, {
        playerTag,
        status,
        backoffKind,
        backoffMinutes,
        nextRefreshAt: nextRefreshAt.toISOString(),
        message: playerResult.message,
      })

      const { error: updateError } = await supabase
        .from('player_rankings')
        .update({
          refresh_attempts: nextAttempts,
          next_refresh_at: nextRefreshAt.toISOString(),
          last_error: playerResult.message,
        })
        .eq('id', row.id)

      if (updateError) {
        console.error(`[process] Failed to update error state for ${row.id}`, {
          error: updateError.message,
        })
      }

      failed += 1
      await sleep(rateLimitDelayMs)
      continue
    }

    const score = calculateRankingScore(playerResult.data)
    const syncedAt = new Date().toISOString()
    const nextRefreshAt = new Date(
      Date.now() + refreshIntervalMinutes * 60 * 1000
    )

    console.log(`[process] Updating player ${playerTag}`, {
      playerTag,
      trophies: playerResult.data.trophies,
      rankingScore: score.rankingScore,
      nextRefreshAt: nextRefreshAt.toISOString(),
    })

    if (row.clash_accounts?.id && playerResult.data.name) {
      const { error: accountError } = await supabase
        .from('clash_accounts')
        .update({ name: playerResult.data.name })
        .eq('id', row.clash_accounts.id)

      if (accountError) {
        console.error(`[process] Failed to update player name ${row.id}`, {
          id: row.id,
          playerTag,
          error: accountError.message,
          code: accountError.code,
          details: accountError.details,
        })
      }
    }

    const { error: updateError } = await supabase
      .from('player_rankings')
      .update({
        current_trophies: playerResult.data.trophies,
        best_trophies: playerResult.data.bestTrophies,
        wins: playerResult.data.wins,
        losses: playerResult.data.losses,
        three_crown_wins: playerResult.data.threeCrownWins,
        pol_current_league: score.polCurrentLeague,
        pol_best_league: score.polBestLeague,
        ranking_score: score.rankingScore,
        score_version: SCORE_VERSION,
        last_synced_at: syncedAt,
        next_refresh_at: nextRefreshAt.toISOString(),
        refresh_attempts: 0,
        last_error: null,
        snapshot: playerResult.data,
      })
      .eq('id', row.id)

    if (updateError) {
      console.error(`[process] Failed to update player ranking ${row.id}`, {
        id: row.id,
        playerTag,
        error: updateError.message,
        code: updateError.code,
        details: updateError.details,
      })
      failed += 1
    } else {
      console.log(`[process] Successfully updated player ${playerTag}`, {
        id: row.id,
        rankingScore: score.rankingScore,
      })
      updated += 1
      if (row.university_id) {
        universitiesToUpdate.add(row.university_id)
      }
    }

    await sleep(rateLimitDelayMs)
  }

  if (universitiesToUpdate.size > 0) {
    console.log('[top-player] Updating campus captains', {
      universities: Array.from(universitiesToUpdate),
    })
  }

  for (const universityId of universitiesToUpdate) {
    const ok = await updateUniversityTopPlayer(supabase, universityId)
    if (ok) {
      topPlayerUpdated += 1
    } else {
      topPlayerFailed += 1
    }
  }

  const duration = Date.now() - startTime
  const result = {
    processed: duePlayers.length,
    updated,
    failed,
    durationMs: duration,
    topPlayerUpdates: {
      updated: topPlayerUpdated,
      failed: topPlayerFailed,
    },
    summary: {
      totalRows: totalCount ?? 0,
      rowsWithRefreshAt: withRefreshAt ?? 0,
      rowsDue: dueCount ?? 0,
    },
  }

  console.log('='.repeat(80))
  console.log('[refresh-player-rankings] Function completed', result)
  console.log('='.repeat(80))

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
})
