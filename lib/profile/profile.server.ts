import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import type { UserProfile } from '@/types/profile'

type ProfileFetchResult =
  | { status: 'ok'; profile: UserProfile }
  | { status: 'missing-profile' }
  | { status: 'missing-university' }
  | { status: 'missing-clash-account'; profile: UserProfile }
  | { status: 'error'; message: string }

export async function getUserProfile(userId: string): Promise<ProfileFetchResult> {
  const supabase = await createClient()

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, university_id, universities (id, name, short_code)')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    logger.error('Failed to load profile', {
      userId,
      error: profileError.message,
    })
    return { status: 'error', message: 'Failed to load profile' }
  }

  if (!profileRow) {
    return { status: 'missing-profile' }
  }

  const universityRow = profileRow.universities
  if (!universityRow) {
    logger.warn('Profile missing university association', {
      userId,
      profileId: profileRow.id,
    })
    return { status: 'missing-university' }
  }

  const baseProfile: UserProfile = {
    profile: {
      id: profileRow.id,
      username: profileRow.username,
      avatarUrl: profileRow.avatar_url,
    },
    university: {
      id: universityRow.id,
      name: universityRow.name,
      shortCode: universityRow.short_code,
    },
    clashAccount: null,
    rankings: null,
    winRate: null,
    campusRank: null,
  }

  const { data: clashAccount, error: clashError } = await supabase
    .from('clash_accounts')
    .select('id, name, player_tag, verified')
    .eq('profile_id', userId)
    .maybeSingle()

  if (clashError) {
    logger.error('Failed to load clash account', {
      userId,
      error: clashError.message,
    })
    return { status: 'error', message: 'Failed to load clash account' }
  }

  if (!clashAccount) {
    return { status: 'missing-clash-account', profile: baseProfile }
  }

  const { data: rankingRow, error: rankingError } = await supabase
    .from('player_rankings')
    .select(
      'current_trophies, best_trophies, wins, losses, three_crown_wins, pol_current_league, pol_best_league, ranking_score'
    )
    .eq('clash_account_id', clashAccount.id)
    .maybeSingle()

  if (rankingError) {
    logger.error('Failed to load player rankings', {
      userId,
      clashAccountId: clashAccount.id,
      error: rankingError.message,
    })
    return { status: 'error', message: 'Failed to load player rankings' }
  }

  const rankings = rankingRow
    ? {
        currentTrophies: rankingRow.current_trophies,
        bestTrophies: rankingRow.best_trophies,
        wins: rankingRow.wins,
        losses: rankingRow.losses,
        threeCrownWins: rankingRow.three_crown_wins,
        polCurrentLeague: rankingRow.pol_current_league,
        polBestLeague: rankingRow.pol_best_league,
        rankingScore: rankingRow.ranking_score,
      }
    : null

  let winRate: number | null = null
  if (rankings) {
    const totalBattles = rankings.wins + rankings.losses
    if (totalBattles > 0) {
      winRate = (rankings.wins / totalBattles) * 100
    }
  }

  let campusRank: number | null = null
  if (rankings && profileRow.university_id) {
    const { count, error: rankError } = await supabase
      .from('player_rankings')
      .select('id', { count: 'exact', head: true })
      .eq('university_id', profileRow.university_id)
      .gt('ranking_score', rankings.rankingScore)

    if (rankError) {
      logger.warn('Failed to compute campus rank', {
        userId,
        universityId: profileRow.university_id,
        error: rankError.message,
      })
    } else {
      campusRank = (count ?? 0) + 1
    }
  }

  const profile: UserProfile = {
    ...baseProfile,
    clashAccount: {
      id: clashAccount.id,
      name: clashAccount.name,
      playerTag: clashAccount.player_tag,
      verified: clashAccount.verified === true,
    },
    rankings,
    winRate,
    campusRank,
  }

  return { status: 'ok', profile }
}
