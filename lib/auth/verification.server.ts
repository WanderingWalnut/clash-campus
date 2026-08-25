import 'server-only'

/**
 * Verification status helper for Clash account verification
 * 
 * Use this to check if a user has completed the Supercell ID verification flow.
 * Users must have a verified clash_account to access protected routes.
 */
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import type { PendingVerificationSession } from '@/types/auth'
import type { ClashRoyaleCard } from '@/types/clash-royale'

export interface VerificationStatus {
    /** Whether the user has a clash_account record */
    hasAccount: boolean
    /** Whether the clash_account is verified */
    isVerified: boolean
    /** The clash_account ID if it exists */
    clashAccountId: string | null
}

/**
 * Get the verification status for a user.
 * 
 * Checks if the user has a clash_account and if it's verified.
 * Both conditions (no account OR unverified account) should redirect to /verify.
 * 
 * @param userId - The user's auth.uid() (same as profile_id)
 * @returns VerificationStatus object
 */
export async function getVerificationStatus(
    userId: string
): Promise<VerificationStatus> {
    const supabase = await createClient()

    try {
        // Only select columns allowed by RLS: id, profile_id
        // We also need verified, so we'll need to update RLS or use a different approach
        const { data: clashAccount, error } = await supabase
            .from('clash_accounts')
            .select('id, profile_id, verified')
            .eq('profile_id', userId)
            .maybeSingle()

        if (error) {
            logger.error('Failed to fetch clash_account for verification check', {
                userId,
                error: error.message,
                code: error.code,
            })
            // Return unverified status on error (fail closed)
            return {
                hasAccount: false,
                isVerified: false,
                clashAccountId: null,
            }
        }

        if (!clashAccount) {
            return {
                hasAccount: false,
                isVerified: false,
                clashAccountId: null,
            }
        }

        return {
            hasAccount: true,
            isVerified: clashAccount.verified === true,
            clashAccountId: clashAccount.id,
        }
    } catch (err) {
        logger.error('Unexpected error checking verification status', {
            userId,
            error: err instanceof Error ? err.message : 'Unknown error',
        })
        // Return unverified status on error (fail closed)
        return {
            hasAccount: false,
            isVerified: false,
            clashAccountId: null,
        }
    }
}

/**
 * Check if the user needs to complete verification.
 * 
 * Convenience function that returns true if user should be redirected to /verify.
 * 
 * @param userId - The user's auth.uid()
 * @returns true if user needs to verify, false if already verified
 */
export async function needsVerification(
    userId: string
): Promise<boolean> {
    const status = await getVerificationStatus(userId)
    return !status.isVerified
}

/**
 * Check if an authenticated user should be redirected to the verification page.
 * 
 * This is a convenience function for use in Server Components that need to
 * conditionally redirect users who haven't completed Clash account verification.
 * 
 * Use this in pages that are accessible to authenticated users but should
 * redirect to /verify if they haven't linked their Clash account.
 * 
 * @param userId - The user's auth.uid()
 * @returns true if user should be redirected to /verify, false otherwise
 * 
 */
export async function shouldRedirectToVerify(
    userId: string
): Promise<boolean> {
    const status = await getVerificationStatus(userId)
    // User should be redirected if they don't have a verified account
    return !status.isVerified
}

/**
 * Get the user's pending verification session if one exists.
 * 
 * This is called on page load to show the existing session instead of
 * the input form if verification is already in progress.
 * 
 * @param userId - The user's auth.uid() (same as profile_id)
 * @returns The pending session data or null if none exists
 */
export async function getPendingVerificationSession(
    userId: string
): Promise<PendingVerificationSession | null> {
    const supabase = await createClient()

    try {
        // First check if user has a clash_account
        const { data: clashAccount, error: accountError } = await supabase
            .from('clash_accounts')
            .select('id, player_tag, name, verified')
            .eq('profile_id', userId)
            .maybeSingle()

        if (accountError) {
            logger.error('Failed to fetch clash_account for pending session', {
                userId,
                error: accountError.message,
            })
            return null
        }

        // No account means no pending session
        if (!clashAccount) {
            return null
        }

        // Already verified - redirect to rankings
        if (clashAccount.verified) {
            redirect('/rankings')
        }

        // Fetch the pending verification session
        const { data: session, error: sessionError } = await supabase
            .from('verification_sessions')
            .select('id, required_deck, expires_at, status')
            .eq('clash_account_id', clashAccount.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (sessionError) {
            logger.error('Failed to fetch verification session', {
                userId,
                clashAccountId: clashAccount.id,
                error: sessionError.message,
            })
            return null
        }

        if (!session || !session.expires_at) {
            // Has account but no pending session (expired or completed)
            logger.warn('Clash account exists but no pending session', {
                userId,
                clashAccountId: clashAccount.id,
            })
            return null
        }

        // Check if session is expired
        const expiresAt = new Date(session.expires_at)
        if (expiresAt < new Date()) {
            logger.info('Verification session expired, deleting', {
                userId,
                sessionId: session.id,
            })
            
            // Delete the expired session
            const { error: deleteError } = await supabase
                .from('verification_sessions')
                .delete()
                .eq('id', session.id)

            if (deleteError) {
                logger.warn('Failed to delete expired verification session', {
                    userId,
                    sessionId: session.id,
                    error: deleteError.message,
                })
            } else {
                logger.info('Deleted expired verification session', {
                    userId,
                    sessionId: session.id,
                })
            }
            
            return null
        }

        logger.info('Found pending verification session', {
            userId,
            sessionId: session.id,
            playerTag: clashAccount.player_tag,
        })

        return {
            sessionId: session.id,
            playerTag: clashAccount.player_tag,
            playerName: clashAccount.name || 'Unknown',
            requiredDeck: session.required_deck as unknown as ClashRoyaleCard[],
            expiresAt: session.expires_at,
        }
    } catch (err) {
        logger.error('Unexpected error fetching pending session', {
            userId,
            error: err instanceof Error ? err.message : 'Unknown error',
        })
        return null
    }
}
