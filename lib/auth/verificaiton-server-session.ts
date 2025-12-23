import 'server-only'

import { logger } from '@/lib/logger'
import type { Json } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/server'
import type { ClashRoyaleCard } from '@/types/clash-royale'
import { generateRandomDeck } from '@/lib/clash-royale/deck'

export type VerificationServerSession =
    | {
        success: true
        sessionId: string
        requiredDeck: ClashRoyaleCard[]
        expiresAt: Date
    }
    | {
        success: false
        error: string
    }

/** 
 * Create a verification server session with a random deck of cards.
 * 
 * The deck is generated from the player's available cards and stored in the 
 * verification_sessions.required_deck field.
 * 
 * @param clashAccountId - The ID of the clash account to create the session for
 * @param availableCards - The list of available cards to generate the deck from
 * @param expiresInHours - The number of hours the session will expire in
 * @returns The verification server session
 */

export async function createVerificationServerSession(
    clashAccountId: string,
    availableCards: ClashRoyaleCard[],
    expiresInHours: number = 24,
): Promise<VerificationServerSession> {
    const supabase = await createClient()

    const requiredDeck = generateRandomDeck(availableCards)

    if (!requiredDeck) {
        logger.error('Failed to generate random deck')
        return {
            success: false,
            error: 'Failed to generate random deck',
        }
    }

    if (requiredDeck.maxCards !== 8) {
        logger.error('Failed to generate random deck with 8 cards', {
            maxCards: requiredDeck.maxCards,
        })
        return {
            success: false,
            error: 'Failed to generate random deck with 8 cards',
        }
    }

    // Calc expiration time
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiresInHours)

    try {
        const { data, error } = await supabase
            .from('verification_sessions')
            .insert({
                clash_account_id: clashAccountId,
                status: 'pending',
                required_deck: requiredDeck.cards as unknown as Json,
                expires_at: expiresAt.toISOString(),
            })
            .select('id, expires_at')
            .single()

        if (error) {
            logger.error('Failed to create verification session', {
                clashAccountId,
                error: error.message,
                code: error.code,
            })
            return {
                success: false,
                error: 'Failed to create verification session. Please try again.',
            }
        }

        if (!data || !data.expires_at) {
            logger.error('Verification session created but no data returned')
            return {
                success: false,
                error: 'Failed to create verification session. Please try again.',
            }
        }

        return {
            success: true,
            sessionId: data.id,
            requiredDeck: requiredDeck.cards,
            expiresAt: new Date(data.expires_at),
        }
    }
    catch (err) {
        logger.error('Unexpected error creating verification session', {
            clashAccountId,
            error: err instanceof Error ? err.message : 'Unknown error',
        })
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        }
    }
}
