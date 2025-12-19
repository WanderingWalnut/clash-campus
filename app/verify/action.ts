'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'
import { ActionResult } from '@/types'
import { requireAuth } from '@/lib/auth/session.server'
import { getVerificationStatus } from '@/lib/auth/verification.server'

/**
 * Bypass verification (development only).
 * 
 * Directly inserts a clash_account. The database trigger will automatically
 * sync the name to profiles.username.
 * 
 * WARNING: This action should be removed or gated behind an environment check
 * before deploying to production.
 */
export async function bypassVerification(): Promise<ActionResult> {
    // Require authentication (redirects if not logged in)
    const user = await requireAuth()

    logger.info('Bypass verification attempt', { userId: user.id })

    const supabase = await createClient()

    try {
        // Check current verification status
        const status = await getVerificationStatus(supabase, user.id)

        if (status.isVerified) {
            logger.info('Bypass verification - already verified', { userId: user.id })
            redirect('/rankings')
        }

        // If user already has an account (shouldn't happen, but check)
        if (status.hasAccount) {
            logger.warn('Bypass verification - account exists but not verified', {
                userId: user.id,
                clashAccountId: status.clashAccount?.id,
            })
            return { error: 'Account exists but is not verified. Please contact support.' }
        }

        // Generate dummy data for development bypass
        const dummyPlayerTag = `#DEV${user.id.substring(0, 8).toUpperCase()}`
        const dummyUsername = `DevPlayer_${user.id.substring(0, 6)}`

        // Direct INSERT - trigger will handle username sync
        const { data, error } = await supabase
            .from('clash_accounts')
            .insert({
                profile_id: user.id,
                player_tag: dummyPlayerTag,
                name: dummyUsername,
                verified: true,
                verified_at: new Date().toISOString(),
            })
            .select('id')
            .single()

        if (error) {
            logger.error('Bypass verification - insert failed', {
                userId: user.id,
                error: error.message,
                code: error.code,
            })

            // Handle unique constraint violations
            if (error.code === '23505') {
                // Unique violation
                if (error.message.includes('clash_accounts_profile_unique')) {
                    return { error: 'You already have a linked Clash account.' }
                }
                if (error.message.includes('clash_accounts_player_tag_unique')) {
                    return { error: 'This player tag is already linked to another account.' }
                }
            }

            return { error: 'Failed to verify account. Please try again.' }
        }

        logger.info('Bypass verification success', {
            userId: user.id,
            clashAccountId: data?.id,
            playerTag: dummyPlayerTag,
        })

        redirect('/rankings')
    } catch (err) {
        // Re-throw redirect errors
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
            throw err
        }

        logger.error('Bypass verification unexpected error', {
            userId: user.id,
            error: err instanceof Error ? err.message : 'Unknown error',
        })
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
