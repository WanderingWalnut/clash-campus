'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect, unstable_rethrow } from 'next/navigation'
import { logger } from '@/lib/logger'
import { InitiateVerificationResult } from '@/types'
import { requireAuth } from '@/lib/auth/session.server'
import { getVerificationStatus } from '@/lib/auth/verification.server'
import { createVerificationServerSession } from '@/lib/auth/verificaiton-server-session'
import { getPlayer, normalizePlayerTag } from '@/lib/clash-royale'

/**
 * Initiate verification flow for linking a Clash Royale account.
 * 
 * This action:
 * 1. Validates authentication
 * 2. Normalizes and validates the player tag
 * 3. Creates an unverified clash_account record
 * 4. Creates a verification session with a required deck
 * 5. Returns session info for the client to display
 * 
 * The user must then set the required deck in-game and call a separate
 * action to complete verification.
 * 
 * @param playerTag - The player's Clash Royale tag (with or without #)
 * @param playerData - The player data fetched from the Clash Royale API
 * @returns Session info on success, or an error message
 */
export async function initiateVerification(
    playerTag: string
): Promise<InitiateVerificationResult> {
    // Require authentication (redirects if not logged in)
    const user = await requireAuth()

    logger.info('Initiate verification attempt', {
        userId: user.id,
        playerTag,
    })

    // Normalize and validate the player tag
    const normalizedTag = normalizePlayerTag(playerTag)
    if (!normalizedTag) {
        logger.warn('Invalid player tag format', { userId: user.id, playerTag })
        return { error: 'Invalid player tag format. Please check and try again.' }
    }

    const supabase = await createClient()

    try {
        // Check current verification status
        const status = await getVerificationStatus(user.id)

        if (status.isVerified) {
            logger.info('Initiate verification - already verified', { userId: user.id })
            redirect('/rankings')
        }

        const playerResult = await getPlayer(normalizedTag, { cacheSeconds: 0 })
        if (!playerResult.success) {
            return { error: playerResult.error }
        }
        const playerData = playerResult.data
        const existingClashAccountId = status.clashAccountId

        // An unverified account can be corrected. Clear its old sessions first.
        if (existingClashAccountId) {
            const { error: deleteSessionError } = await supabase
                .from('verification_sessions')
                .delete()
                .eq('clash_account_id', existingClashAccountId)
                .in('status', ['pending', 'expired'])

            if (deleteSessionError) {
                logger.error('Initiate verification - failed to clear old sessions', {
                    userId: user.id,
                    clashAccountId: existingClashAccountId,
                    error: deleteSessionError.message,
                })
                return { error: 'Failed to restart verification. Please try again.' }
            }
        }

        const accountMutation = existingClashAccountId
            ? supabase
                .from('clash_accounts')
                .update({ player_tag: normalizedTag, name: playerData.name })
                .eq('id', existingClashAccountId)
                .eq('verified', false)
            : supabase
                .from('clash_accounts')
                .insert({
                    profile_id: user.id,
                    player_tag: normalizedTag,
                    name: playerData.name,
                    verified: false,
                })

        const { data: clashAccount, error: insertError } = await accountMutation
            .select('id')
            .single()

        if (insertError) {
            logger.error('Initiate verification - insert clash_account failed', {
                userId: user.id,
                playerTag: normalizedTag,
                error: insertError.message,
                code: insertError.code,
            })

            // Handle unique constraint violations
            if (insertError.code === '23505') {
                if (insertError.message.includes('clash_accounts_profile_unique')) {
                    return { error: 'You already have a linked Clash account.' }
                }
                if (insertError.message.includes('clash_accounts_player_tag_unique')) {
                    return { error: 'This player tag is already linked to another account.' }
                }
            }

            // Handle FK constraint (profile doesn't exist)
            if (insertError.code === '23503') {
                logger.error('Profile not found for user', { userId: user.id })
                return { error: 'Account setup incomplete. Please try signing up again.' }
            }

            return { error: 'Failed to link Clash account. Please try again.' }
        }

        if (!clashAccount || !clashAccount.id) {
            logger.error('Clash account created but no ID returned', { userId: user.id })
            return { error: 'Failed to link Clash account. Please try again.' }
        }

        // Create verification session with required deck
        const sessionResult = await createVerificationServerSession(
            clashAccount.id,
            playerData.cards
        )

        if (!sessionResult.success) {
            logger.error('Failed to create verification session', {
                userId: user.id,
                clashAccountId: clashAccount.id,
                error: sessionResult.error,
            })

            return { error: sessionResult.error }
        }

        logger.info('Initiate verification success', {
            userId: user.id,
            clashAccountId: clashAccount.id,
            sessionId: sessionResult.sessionId,
            playerTag: normalizedTag,
            playerName: playerData.name,
        })

        return {
            success: true,
            sessionId: sessionResult.sessionId,
            playerTag: playerData.tag,
            playerName: playerData.name,
            requiredDeck: sessionResult.requiredDeck,
            expiresAt: sessionResult.expiresAt.toISOString(),
        }
    } catch (err) {
        // Re-throw Next.js framework-controlled exceptions (redirect, notFound, etc.)
        unstable_rethrow(err)

        logger.error('Initiate verification unexpected error', {
            userId: user.id,
            playerTag,
            error: err instanceof Error ? err.message : 'Unknown error',
        })
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
