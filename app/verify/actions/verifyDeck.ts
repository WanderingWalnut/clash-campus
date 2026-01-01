'use server'

import { createClient } from '@/lib/supabase/server'
import { unstable_rethrow } from 'next/navigation'
import { logger } from '@/lib/logger'
import { VerifyDeckResult } from '@/types'
import { requireAuth } from '@/lib/auth/session.server'
import { calculateRankingScore, getPlayer, normalizePlayerTag, SCORE_VERSION } from '@/lib/clash-royale'
import type { ClashRoyaleCard } from '@/types/clash-royale'
import type { Json } from '@/lib/supabase/types'
import { createAdminClient } from '@/lib/supabase/admin'

const DECK_CHECK_THROTTLE_SECONDS = 15
const PLAYER_RANKINGS_REFRESH_MINUTES = 30

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
        // Load the user's linked clash_account (if any)
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

        // Find the latest pending verification session (optionally filtered by ID)
        let sessionQuery = supabase
            .from('verification_sessions')
            .select('id, required_deck, expires_at, last_checked_at')
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

        // Block verification if the session has expired (server time)
        if (session.expires_at && new Date(session.expires_at) < new Date()) {
            return { error: 'Verification session expired. Please start again.' }
        }

        // Throttle repeated verification attempts
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

        // Validate required deck payload
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

        // Fetch fresh player data from the API (no cache)
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

        // Confirm the returned player is the same as the linked account
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

        // Approve the verification session and mark the account verified
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

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('university_id')
            .eq('id', user.id)
            .maybeSingle()

        if (profileError || !profile) {
            logger.error('Verify deck - failed to fetch profile for rankings', {
                userId: user.id,
                sessionId: session.id,
                error: profileError?.message,
            })
        } else {
            try {
                const syncTime = new Date()
                const nextRefreshAt = new Date(
                    syncTime.getTime() + PLAYER_RANKINGS_REFRESH_MINUTES * 60 * 1000
                )
                const score = calculateRankingScore(playerResult.data)
                const admin = createAdminClient()

                const { error: rankingError } = await admin
                    .from('player_rankings')
                    .upsert({
                        clash_account_id: clashAccount.id,
                        university_id: profile.university_id,
                        current_trophies: playerResult.data.trophies,
                        best_trophies: playerResult.data.bestTrophies,
                        wins: playerResult.data.wins,
                        losses: playerResult.data.losses,
                        three_crown_wins: playerResult.data.threeCrownWins,
                        ranking_score: score.rankingScore,
                        pol_current_league: score.polCurrentLeague,
                        pol_best_league: score.polBestLeague,
                        score_version: SCORE_VERSION,
                        snapshot: playerResult.data as unknown as Json,
                        last_synced_at: syncTime.toISOString(),
                        next_refresh_at: nextRefreshAt.toISOString(),
                        refresh_attempts: 0,
                        last_error: null,
                    }, {
                        onConflict: 'clash_account_id',
                    })

                if (rankingError) {
                    logger.error('Verify deck - failed to upsert player rankings', {
                        userId: user.id,
                        sessionId: session.id,
                        error: rankingError.message,
                    })
                }
            } catch (error) {
                logger.error('Verify deck - unexpected ranking upsert error', {
                    userId: user.id,
                    sessionId: session.id,
                    error: error instanceof Error ? error.message : 'Unknown error',
                })
            }
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
