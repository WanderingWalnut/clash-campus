/**
 * Type definitions for the Royale Rankings page.
 */

/**
 * Represents the direction of rank change.
 */
export type RankChangeType = 'up' | 'down' | 'same';

/**
 * Represents a player entry in the full rankings table.
 */
export interface RankedPlayer {
    /** Position on the leaderboard */
    rank: number;
    /** Player's display name */
    name: string;
    /** Player's Clash Royale tag (e.g., #9V82J9) */
    tag: string;
    /** Full university name */
    university: string;
    /** Abbreviated university name for mobile displays */
    universityShort: string;
    /** Composite score calculated from trophies, wins, and other metrics */
    score: number;
    /** Current trophy count */
    trophies: number;
    /** Total number of wins */
    wins: number;
    /** Path of Legends current league (0-10) */
    polCurrentLeague: number;
    /** Path of Legends best league (0-10) */
    polBestLeague: number;
    /** Direction of rank change since last update */
    change: RankChangeType;
    /** Whether this player is the currently logged-in user */
    isUser?: boolean;
}

/**
 * Represents a university/campus entry in the campus rankings.
 */
export interface RankedCampus {
    /** Position on the leaderboard */
    rank: number;
    /** Full university name */
    name: string;
    /** Abbreviated university name */
    short: string;
    /** Average composite score of all players */
    avgScore: number;
    /** Number of verified active players */
    activePlayers: number;
    /** Name of the top-ranked player at this campus */
    topPlayer: string;
    /** Direction of rank change since last update */
    change: RankChangeType;
}

/**
 * The current view mode in the rankings page.
 */
export type RankingsMode = 'players' | 'campuses';

