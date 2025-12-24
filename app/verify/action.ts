'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect, unstable_rethrow } from 'next/navigation'
import { logger } from '@/lib/logger'
import { InitiateVerificationResult, VerifyDeckResult } from '@/types'
import { requireAuth } from '@/lib/auth/session.server'
import { getVerificationStatus } from '@/lib/auth/verification.server'
import { createVerificationServerSession } from '@/lib/auth/verificaiton-server-session'
import { getPlayer, normalizePlayerTag } from '@/lib/clash-royale'
import type { ClashRoyalePlayer } from '@/types/clash-royale'
import type { ClashRoyaleCard } from '@/types/clash-royale'

const DECK_CHECK_THROTTLE_SECONDS = 15

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

        // If user already has an unverified account, they should complete that verification
        if (status.hasAccount) {
            logger.warn('Initiate verification - unverified account exists', {
                userId: user.id,
            })
            return { error: 'You already have a pending verification. Please complete the existing verification or contact support.' }
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

/**
 * Verify the user's current Clash Royale deck against the required deck.
 * 
 * This action:
 * 1. Validates authentication and ownership
 * 2. Loads the latest pending verification session
 * 3. Fetches fresh player data from the Clash Royale API
 * 4. Compares the current deck to the required deck
 * 5. Updates the verification session and clash account on success
 */
export async function verifyDeck(sessionId?: string): Promise<VerifyDeckResult> {
    const user = await requireAuth()
    const supabase = await createClient()

    logger.info('Verify deck attempt', {
        userId: user.id,
        sessionId,
    })

    try {
        const { data: clashAccount, error: accountError } = await supabase
            .from('clash_accounts')
            .select('id, player_tag, verified')
            .eq('profile_id', user.id)
            .maybeSingle()

        if (accountError || !clashAccount) {
            logger.error('Verify deck - clash account not found', {
                userId: user.id,
                error: accountError?.message,
            })
            return { error: 'No linked Clash account found. Please start verification again.' }
        }

        if (clashAccount.verified) {
            return { success: true }
        }

        let sessionQuery = supabase
            .from('verification_sessions')
            .select('id, required_deck, expires_at, status, last_checked_at')
            .eq('clash_account_id', clashAccount.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)

        if (sessionId) {
            sessionQuery = sessionQuery.eq('id', sessionId)
        }

        const { data: session, error: sessionError } = await sessionQuery.maybeSingle()

        if (sessionError || !session) {
            logger.warn('Verify deck - no pending session found', {
                userId: user.id,
                sessionId,
                error: sessionError?.message,
            })
            return { error: 'No pending verification session found. Please start verification again.' }
        }

        const now = new Date()
        if (session.expires_at && new Date(session.expires_at) < now) {
            const { error: expireError } = await supabase.rpc('record_verification_check', {
                p_session_id: session.id,
                p_failure_reason: 'Session expired',
                p_mark_expired: true,
            })

            if (expireError) {
                logger.error('Verify deck - failed to mark session expired', {
                    userId: user.id,
                    sessionId: session.id,
                    error: expireError.message,
                })
            }

            return { error: 'Verification session expired. Please start again.' }
        }

        if (session.last_checked_at) {
            const lastChecked = new Date(session.last_checked_at).getTime()
            const elapsedSeconds = Math.floor((Date.now() - lastChecked) / 1000)
            if (elapsedSeconds < DECK_CHECK_THROTTLE_SECONDS) {
                const retryAfterSeconds = DECK_CHECK_THROTTLE_SECONDS - elapsedSeconds
                return {
                    error: `Please wait ${retryAfterSeconds}s before verifying again.`,
                    retryAfterSeconds,
                }
            }
        }

        const requiredDeck = session.required_deck as unknown as ClashRoyaleCard[] | null
        if (!requiredDeck || !Array.isArray(requiredDeck) || requiredDeck.length === 0) {
            logger.error('Verify deck - required deck missing', {
                userId: user.id,
                sessionId: session.id,
            })
            return { error: 'Verification deck is missing. Please contact support.' }
        }

        const requiredIds = new Set(requiredDeck.map((card) => card.id))
        if (requiredIds.size !== 8) {
            logger.error('Verify deck - invalid required deck', {
                userId: user.id,
                sessionId: session.id,
                requiredCount: requiredIds.size,
            })
            return { error: 'Verification deck is invalid. Please contact support.' }
        }

        const playerResult = await getPlayer(clashAccount.player_tag, { cacheSeconds: 0 })
        if (!playerResult.success) {
            const { error: recordError } = await supabase.rpc('record_verification_check', {
                p_session_id: session.id,
                p_failure_reason: playerResult.error,
                p_mark_expired: false,
            })

            if (recordError) {
                logger.error('Verify deck - failed to record API failure', {
                    userId: user.id,
                    sessionId: session.id,
                    error: recordError.message,
                })
            }

            return { error: playerResult.error }
        }

        const normalizedAccountTag = normalizePlayerTag(clashAccount.player_tag)
        const normalizedPlayerTag = normalizePlayerTag(playerResult.data.tag)
        if (!normalizedAccountTag || normalizedAccountTag !== normalizedPlayerTag) {
            logger.warn('Verify deck - player tag mismatch', {
                userId: user.id,
                accountTag: normalizedAccountTag,
                playerTag: normalizedPlayerTag,
            })
            const { error: recordError } = await supabase.rpc('record_verification_check', {
                p_session_id: session.id,
                p_failure_reason: 'Player tag mismatch',
                p_mark_expired: false,
            })

            if (recordError) {
                logger.error('Verify deck - failed to record tag mismatch', {
                    userId: user.id,
                    sessionId: session.id,
                    error: recordError.message,
                })
            }
            return { error: 'Player tag mismatch. Please contact support.' }
        }

        // Check if the current deck matches the required deck
        const currentDeck = playerResult.data.currentDeck ?? []
        const currentIds = new Set(currentDeck.map((card) => card.id))
        const currentDeckNames = currentDeck.map((card) => card.name)
        const requiredDeckNames = requiredDeck.map((card) => card.name)

        const deckMatches = currentIds.size === 8
            && requiredIds.size === 8
            && [...requiredIds].every((id) => currentIds.has(id))

        if (!deckMatches) {
            const missingCardIds = [...requiredIds].filter((id) => !currentIds.has(id))
            const extraCardIds = [...currentIds].filter((id) => !requiredIds.has(id))
            const missingCards = requiredDeck
                .filter((card) => missingCardIds.includes(card.id))
                .map((card) => card.name)
            const extraCards = currentDeck
                .filter((card) => extraCardIds.includes(card.id))
                .map((card) => card.name)

            logger.info('Verify deck mismatch', {
                userId: user.id,
                sessionId: session.id,
                requiredDeck: requiredDeckNames,
                currentDeck: currentDeckNames,
                missingCards,
                extraCards,
            })

            const { error: recordError } = await supabase.rpc('record_verification_check', {
                p_session_id: session.id,
                p_failure_reason: 'Deck does not match',
                p_mark_expired: false,
            })

            if (recordError) {
                logger.error('Verify deck - failed to record deck mismatch', {
                    userId: user.id,
                    sessionId: session.id,
                    error: recordError.message,
                })
            }

            return { error: 'Your current deck does not match the required deck.' }
        }

        const { data: approved, error: approveError } = await supabase.rpc('approve_verification_session', {
            p_session_id: session.id,
        })

        if (approveError || !approved) {
            logger.error('Verify deck - failed to approve session', {
                userId: user.id,
                sessionId: session.id,
                error: approveError?.message,
            })
            return { error: 'Verification failed. Please try again.' }
        }

        logger.info('Verify deck success', {
            userId: user.id,
            sessionId: session.id,
            clashAccountId: clashAccount.id,
            requiredDeck: requiredDeckNames,
            currentDeck: currentDeckNames,
        })

        return { success: true }
    } catch (err) {
        unstable_rethrow(err)

        logger.error('Verify deck unexpected error', {
            userId: user.id,
            sessionId,
            error: err instanceof Error ? err.message : 'Unknown error',
        })
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
