import 'server-only'

import { logger } from '@/lib/logger'
import type { ClashRoyalePlayer, ClashRoyaleApiResult } from '@/types/clash-royale'

/**
 * Clash Royale API client.
 * 
 * This module handles all communication with the Supercell Clash Royale API.
 * It should only be used server-side to protect the API key.
 * 
 */

const CLASH_ROYALE_API_BASE = 'https://api.clashroyale.com/v1'

/**
 * Validates and normalizes a player tag.
 * 
 * Player tags:
 * - Start with '#' (we add it if missing)
 * - Contain only alphanumeric characters after the '#'
 * - Are uppercase
 * 
 * @param tag - The player tag to validate
 * @returns The normalized tag, or null if invalid
 */
export function normalizePlayerTag(tag: string): string | null {
    if (!tag || typeof tag !== 'string') {
        return null
    }

    // Remove whitespace and convert to uppercase
    let normalized = tag.trim().toUpperCase()

    // Add '#' if missing
    if (!normalized.startsWith('#')) {
        normalized = '#' + normalized
    }

    // Validate format: # followed by alphanumeric characters only
    // Clash Royale tags use: 0289PYLQGRJCUV
    const tagRegex = /^#[0289PYLQGRJCUV]+$/
    if (!tagRegex.test(normalized)) {
        return null
    }

    // Tags are typically 5-12 characters (including #)
    if (normalized.length < 4 || normalized.length > 15) {
        return null
    }

    return normalized
}

/**
 * Fetches a player's profile from the Clash Royale API.
 * 
 * @param playerTag - The player tag (with or without '#')
 * @returns The player data or an error
 */
export async function getPlayer(playerTag: string): Promise<ClashRoyaleApiResult<ClashRoyalePlayer>> {
    const apiKey = process.env.CLASH_ROYALE_API_KEY

    if (!apiKey) {
        logger.error('CLASH_ROYALE_API_KEY is not configured')
        return {
            success: false,
            error: 'Server configuration error',
        }
    }

    // Validate and normalize the tag
    const normalizedTag = normalizePlayerTag(playerTag)
    if (!normalizedTag) {
        return {
            success: false,
            error: 'Invalid player tag format. Tags should be like #2YPQVV8P',
        }
    }

    // URL-encode the tag (# becomes %23)
    const encodedTag = encodeURIComponent(normalizedTag)
    const url = `${CLASH_ROYALE_API_BASE}/players/${encodedTag}`

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            // Cache for 5 minutes to reduce API calls
            next: { revalidate: 300 },
        })

        if (!response.ok) {
            // Map Clash Royale API errors to user-friendly messages
            const errorMessages: Record<number, string> = {
                400: 'Invalid player tag format',
                403: 'API access denied',
                404: 'Player not found. Please check your player tag.',
                429: 'Too many requests. Please try again in a few minutes.',
                500: 'Clash Royale API is temporarily unavailable',
                503: 'Clash Royale API is under maintenance',
            }

            const message = errorMessages[response.status] || `API error: ${response.statusText}`

            logger.warn('Clash Royale API error', {
                status: response.status,
                playerTag: normalizedTag,
            })

            return {
                success: false,
                error: message,
            }
        }

        const data = await response.json() as ClashRoyalePlayer
        return {
            success: true,
            data,
        }
    } catch (error) {
        logger.error('Failed to fetch player from Clash Royale API', {
            error: error instanceof Error ? error.message : 'Unknown error',
            playerTag: normalizedTag,
        })

        return {
            success: false,
            error: 'Failed to connect to Clash Royale API. Please try again.',
        }
    }
}

