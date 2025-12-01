/**
 * Mock data for the Royale Rankings page.
 * This will be replaced with real Supabase queries in production.
 */

import type { RankedPlayer, RankedCampus } from '@/types/rankings';

/**
 * Sample player data for the rankings leaderboard.
 * Sorted by composite score in descending order.
 */
export const MOCK_PLAYERS: RankedPlayer[] = [
    {
        rank: 1,
        name: 'NovaBreaker',
        tag: '#9V82J9',
        university: 'Massachusetts Inst. Tech',
        universityShort: 'MIT',
        score: 98.4,
        trophies: 9000,
        wins: 1240,
        change: 'up',
    },
    {
        rank: 2,
        name: 'LogBaitGod',
        tag: '#829LKA',
        university: 'UCLA',
        universityShort: 'UCLA',
        score: 96.2,
        trophies: 8840,
        wins: 1105,
        change: 'down',
    },
    {
        rank: 3,
        name: 'HogRider22',
        tag: '#192KLQ',
        university: 'UT Austin',
        universityShort: 'UT Austin',
        score: 95.8,
        trophies: 8520,
        wins: 980,
        change: 'same',
    },
    {
        rank: 4,
        name: 'ElixerLeak',
        tag: '#MX9291',
        university: 'Stanford',
        universityShort: 'Stanford',
        score: 94.1,
        trophies: 8410,
        wins: 850,
        change: 'up',
    },
    {
        rank: 5,
        name: 'RocketCycle',
        tag: '#QA9211',
        university: 'Waterloo',
        universityShort: 'Waterloo',
        score: 93.5,
        trophies: 8390,
        wins: 910,
        change: 'up',
    },
    {
        rank: 42,
        name: 'You (KingSlayer)',
        tag: '#MYTAG1',
        university: 'Stanford',
        universityShort: 'Stanford',
        score: 82.1,
        trophies: 7500,
        wins: 420,
        change: 'same',
        isUser: true,
    },
];

/**
 * Sample campus data for the university rankings.
 * Sorted by average composite score in descending order.
 */
export const MOCK_CAMPUSES: RankedCampus[] = [
    {
        rank: 1,
        name: 'Massachusetts Inst. Tech',
        short: 'MIT',
        avgScore: 92.5,
        activePlayers: 142,
        topPlayer: 'NovaBreaker',
        change: 'same',
    },
    {
        rank: 2,
        name: 'Stanford University',
        short: 'Stanford',
        avgScore: 91.8,
        activePlayers: 210,
        topPlayer: 'ElixerLeak',
        change: 'up',
    },
    {
        rank: 3,
        name: 'University of Waterloo',
        short: 'Waterloo',
        avgScore: 89.4,
        activePlayers: 98,
        topPlayer: 'RocketCycle',
        change: 'up',
    },
    {
        rank: 4,
        name: 'UCLA',
        short: 'UCLA',
        avgScore: 88.9,
        activePlayers: 305,
        topPlayer: 'LogBaitGod',
        change: 'down',
    },
];

