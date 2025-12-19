/**
 * Verification status helper for Clash account verification
 * 
 * Use this to check if a user has completed the Supercell ID verification flow.
 * Users must have a verified clash_account to access protected routes.
 */
import { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type { Database, Tables } from '@/lib/supabase/types'

export type ClashAccount = Tables<'clash_accounts'>

export interface VerificationStatus {
    /** Whether the user has a clash_account record */
    hasAccount: boolean
    /** Whether the clash_account is verified */
    isVerified: boolean
    /** The clash_account record if it exists */
    clashAccount: ClashAccount | null
}

/**
 * Get the verification status for a user.
 * 
 * Checks if the user has a clash_account and if it's verified.
 * Both conditions (no account OR unverified account) should redirect to /verify.
 * 
 * @param supabase - The Supabase client
 * @param userId - The user's auth.uid() (same as profile_id)
 * @returns VerificationStatus object
 */
export async function getVerificationStatus(
    supabase: SupabaseClient<Database>,
    userId: string
): Promise<VerificationStatus> {
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
                clashAccount: null,
            }
        }

        if (!clashAccount) {
            return {
                hasAccount: false,
                isVerified: false,
                clashAccount: null,
            }
        }

        return {
            hasAccount: true,
            isVerified: clashAccount.verified === true,
            // Only partial data available due to RLS, so we set to null
            // The full clashAccount object isn't needed for verification checks
            clashAccount: null,
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
            clashAccount: null,
        }
    }
}

/**
 * Check if the user needs to complete verification.
 * 
 * Convenience function that returns true if user should be redirected to /verify.
 * 
 * @param supabase - The Supabase client
 * @param userId - The user's auth.uid()
 * @returns true if user needs to verify, false if already verified
 */
export async function needsVerification(
    supabase: SupabaseClient<Database>,
    userId: string
): Promise<boolean> {
    const status = await getVerificationStatus(supabase, userId)
    return !status.isVerified
}

