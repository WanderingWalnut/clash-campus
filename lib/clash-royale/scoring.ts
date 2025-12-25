import type { ClashRoyalePlayer } from '@/types/clash-royale'

export const SCORE_VERSION = 'v1'

const MAX_TROPHIES = 10000
const MAX_POL_LEAGUE = 10

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

export type PlayerRankingScore = {
    rankingScore: number
    rawScore: number
    polCurrentLeague: number
    polBestLeague: number
    winRate: number
    threeCrownRate: number
}

export function calculateRankingScore(player: ClashRoyalePlayer): PlayerRankingScore {
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

    const rankingScore = rawScore

    return {
        rankingScore,
        rawScore,
        polCurrentLeague,
        polBestLeague,
        winRate,
        threeCrownRate,
    }
}
