/**
 * Type definitions for the user profile experience.
 */

export interface UserProfile {
  profile: {
    id: string
    username: string | null
    avatarUrl: string | null
  }
  university: {
    id: string
    name: string
    shortCode: string
  } | null
  clashAccount: {
    id: string
    name: string | null
    playerTag: string
    verified: boolean
  } | null
  rankings: {
    currentTrophies: number
    bestTrophies: number
    wins: number
    losses: number
    threeCrownWins: number
    polCurrentLeague: number
    polBestLeague: number
    rankingScore: number
  } | null
  winRate: number | null
  campusRank: number | null
}
