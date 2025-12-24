'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect, unstable_rethrow } from 'next/navigation'
import { logger } from '@/lib/logger'
import { InitiateVerificationResult } from '@/types'
import { requireAuth } from '@/lib/auth/session.server'
import { getVerificationStatus } from '@/lib/auth/verification.server'
import { createVerificationServerSession } from '@/lib/auth/verificaiton-server-session'
import { normalizePlayerTag } from '@/lib/clash-royale'
import type { ClashRoyalePlayer } from '@/types/clash-royale'

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
    playerTag: string,
    playerData: ClashRoyalePlayer
): Promise<InitiateVerificationResult> {
    // Require authentication (redirects if not logged in)
    const user = await requireAuth()

    logger.info('Initiate verification attempt', {
        userId: user.id,
        playerTag,
        playerName: playerData.name,
    })

    // Normalize and validate the player tag
    const normalizedTag = normalizePlayerTag(playerTag)
    if (!normalizedTag) {
        logger.warn('Invalid player tag format', { userId: user.id, playerTag })
        return { error: 'Invalid player tag format. Please check and try again.' }
    }

    // Verify that the playerData matches the tag (basic sanity check)
    const normalizedDataTag = normalizePlayerTag(playerData.tag)
    if (normalizedDataTag !== normalizedTag) {
        logger.warn('Player tag mismatch', {
            userId: user.id,
            providedTag: normalizedTag,
            dataTag: normalizedDataTag,
        })
        return { error: 'Player data does not match the provided tag.' }
    }

    const supabase = await createClient()

    try {
        // Check current verification status
        const status = await getVerificationStatus(user.id)

        if (status.isVerified) {
            logger.info('Initiate verification - already verified', { userId: user.id })
            redirect('/rankings')
        }

        // If user already has an unverified account, check for expired sessions and clean them up
        if (status.hasAccount) {
            // Get the clash_account to check for expired sessions
            const { data: clashAccount, error: accountError } = await supabase
                .from('clash_accounts')
                .select('id')
                .eq('profile_id', user.id)
                .maybeSingle()

            if (accountError || !clashAccount) {
                logger.error('Initiate verification - failed to fetch clash_account', {
                    userId: user.id,
                    error: accountError?.message,
                })
                return { error: 'Failed to check existing verification. Please try again.' }
            }

            // Delete expired sessions (status = 'expired' OR past expiration)
            // The RLS policy will ensure only expired sessions can be deleted
            const now = new Date().toISOString()

            // Delete sessions with status = 'expired'
            const { error: deleteExpiredError } = await supabase
                .from('verification_sessions')
                .delete()
                .eq('clash_account_id', clashAccount.id)
                .eq('status', 'expired')

            // Delete pending sessions that have expired (expires_at < now)
            const { error: deletePendingExpiredError } = await supabase
                .from('verification_sessions')
                .delete()
                .eq('clash_account_id', clashAccount.id)
                .eq('status', 'pending')
                .lt('expires_at', now)

            if (deleteExpiredError || deletePendingExpiredError) {
                logger.warn('Initiate verification - failed to delete some expired sessions', {
                    userId: user.id,
                    clashAccountId: clashAccount.id,
                    expiredError: deleteExpiredError?.message,
                    pendingError: deletePendingExpiredError?.message,
                })
                // Continue anyway - the RLS policy might have prevented deletion
                // but we'll check for pending sessions below
            }

            // Check if there are any remaining pending (non-expired) sessions
            const { data: pendingSessions, error: pendingError } = await supabase
                .from('verification_sessions')
                .select('id, expires_at')
                .eq('clash_account_id', clashAccount.id)
                .eq('status', 'pending')
                .maybeSingle()

            if (pendingError) {
                logger.error('Initiate verification - failed to check pending sessions', {
                    userId: user.id,
                    error: pendingError.message,
                })
                return { error: 'Failed to check existing verification. Please try again.' }
            }

            // If there's a pending session, check if it's expired
            if (pendingSessions) {
                const isExpired = pendingSessions.expires_at
                    ? new Date(pendingSessions.expires_at) < new Date()
                    : false

                if (!isExpired) {
                    logger.warn('Initiate verification - unverified account exists with active session', {
                        userId: user.id,
                        sessionId: pendingSessions.id,
                    })
                    return { error: 'You already have a pending verification session. Please complete it or wait for it to expire.' }
                }
            }

            // If we get here, either no pending sessions exist or they were all expired
            // Allow the user to create a new verification
            logger.info('Initiate verification - expired sessions cleaned up, allowing new verification', {
                userId: user.id,
            })
        }

        // Create unverified clash_account
        // Note: Profile should already exist from signup trigger (handle_new_user)
        // The database trigger will sync the name to profiles.username
        const { data: clashAccount, error: insertError } = await supabase
            .from('clash_accounts')
            .insert({
                profile_id: user.id,
                player_tag: normalizedTag,
                name: playerData.name,
                verified: false,
            })
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
            // Clean up the clash_account if session creation fails
            logger.error('Failed to create verification session, cleaning up clash_account', {
                userId: user.id,
                clashAccountId: clashAccount.id,
                error: sessionResult.error,
            })

            await supabase
                .from('clash_accounts')
                .delete()
                .eq('id', clashAccount.id)

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
