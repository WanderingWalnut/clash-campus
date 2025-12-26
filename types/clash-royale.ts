/**
 * Type definitions for Clash Royale API responses.
 * Based on the official Supercell Clash Royale API.
 * @see https://developer.clashroyale.com
 */

/**
 * Card icon URLs from the Clash Royale API.
 */
export interface CardIconUrls {
    medium: string
    evolutionMedium?: string
    heroMedium?: string
}

/**
 * A Clash Royale card.
 */
export interface ClashRoyaleCard {
    name: string
    id: number
    level: number
    maxLevel: number
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'champion'
    count: number
    elixirCost?: number
    starLevel?: number
    maxEvolutionLevel?: number
    iconUrls: CardIconUrls
}

/**
 * Clan information for a player.
 */
export interface ClashRoyaleClan {
    tag: string
    name: string
    badgeId: number
}

/**
 * Arena information.
 */
export interface ClashRoyaleArena {
    id: number
    name: string
    rawName?: string
}

/**
 * League statistics for a season.
 */
export interface SeasonResult {
    id?: string
    trophies: number
    bestTrophies?: number
    rank?: number | null
    leagueNumber?: number
}

/**
 * League statistics containing current, previous, and best season data.
 */
export interface LeagueStatistics {
    currentSeason?: SeasonResult
    previousSeason?: SeasonResult
    bestSeason?: SeasonResult
}

/**
 * Player badge information.
 */
export interface PlayerBadge {
    name: string
    level: number
    maxLevel: number
    progress: number
    target?: number
    iconUrls: {
        large: string
    }
}

/**
 * Player achievement information.
 */
export interface PlayerAchievement {
    name: string
    stars: number
    value: number
    target: number
    info: string
    completionInfo: string | null
}

/**
 * Full player profile from the Clash Royale API.
 */
export interface ClashRoyalePlayer {
    tag: string
    name: string
    expLevel: number
    trophies: number
    bestTrophies: number
    wins: number
    losses: number
    battleCount: number
    threeCrownWins: number
    challengeCardsWon: number
    challengeMaxWins: number
    tournamentCardsWon: number
    tournamentBattleCount: number
    role?: string
    donations: number
    donationsReceived: number
    totalDonations: number
    warDayWins: number
    clanCardsCollected: number
    clan?: ClashRoyaleClan
    arena: ClashRoyaleArena
    leagueStatistics?: LeagueStatistics
    currentPathOfLegendSeasonResult?: SeasonResult
    lastPathOfLegendSeasonResult?: SeasonResult
    bestPathOfLegendSeasonResult?: SeasonResult
    badges: PlayerBadge[]
    achievements: PlayerAchievement[]
    cards: ClashRoyaleCard[]
    currentDeck: ClashRoyaleCard[]
    currentFavouriteCard?: ClashRoyaleCard
    starPoints: number
    expPoints: number
    totalExpPoints: number
}

/**
 * Error response from our API.
 */
export interface ClashRoyaleApiError {
    error: string
}

/**
 * Result type for Clash Royale API calls.
 */
export type ClashRoyaleApiResult<T> =
    | { success: true; data: T }
    | { success: false; error: string }

