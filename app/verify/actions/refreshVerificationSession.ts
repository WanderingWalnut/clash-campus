'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect, unstable_rethrow } from 'next/navigation'
import { logger } from '@/lib/logger'
import { RefreshVerificationSessionResult } from '@/types'
import { requireAuth } from '@/lib/auth/session.server'
import { getPlayer } from '@/lib/clash-royale'
import { createVerificationServerSession } from '@/lib/auth/verificaiton-server-session'
import type { ClashRoyaleCard } from '@/types/clash-royale'

/**
 * Refresh the verification session for an existing Clash account.
 * 
 * This action:
 * 1. Validates authentication and account existence
 * 2. Returns an active pending session if one exists
 * 3. Deletes expired sessions
 * 4. Creates a new verification session with a fresh required deck
 */
export async function refreshVerificationSession(): Promise<RefreshVerificationSessionResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  logger.info('Refresh verification session attempt', {
    userId: user.id,
  })

  try {
    const { data: clashAccount, error: accountError } = await supabase
      .from('clash_accounts')
      .select('id, player_tag, name, verified')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (accountError || !clashAccount) {
      logger.error('Refresh verification - clash account not found', {
        userId: user.id,
        error: accountError?.message,
      })
      return { error: 'No linked Clash account found. Please start verification again.' }
    }

    if (clashAccount.verified) {
      logger.info('Refresh verification - already verified', { userId: user.id })
      redirect('/rankings')
    }

    const { data: pendingSession, error: sessionError } = await supabase
      .from('verification_sessions')
      .select('id, required_deck, expires_at')
      .eq('clash_account_id', clashAccount.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessionError) {
      logger.error('Refresh verification - failed to check pending session', {
        userId: user.id,
        clashAccountId: clashAccount.id,
        error: sessionError.message,
      })
      return { error: 'Failed to check existing verification. Please try again.' }
    }

    if (pendingSession?.expires_at && pendingSession.required_deck) {
      const isExpired = new Date(pendingSession.expires_at) < new Date()
      if (!isExpired) {
        return {
          success: true,
          sessionId: pendingSession.id,
          requiredDeck: pendingSession.required_deck as unknown as ClashRoyaleCard[],
          expiresAt: pendingSession.expires_at,
          playerTag: clashAccount.player_tag,
          playerName: clashAccount.name || 'Unknown',
        }
      }
    }

    if (pendingSession && (!pendingSession.expires_at || !pendingSession.required_deck)) {
      logger.warn('Refresh verification - pending session missing required data', {
        userId: user.id,
        sessionId: pendingSession.id,
      })
    }

    const now = new Date().toISOString()

    const { error: deleteExpiredError } = await supabase
      .from('verification_sessions')
      .delete()
      .eq('clash_account_id', clashAccount.id)
      .eq('status', 'expired')

    const { error: deletePendingExpiredError } = await supabase
      .from('verification_sessions')
      .delete()
      .eq('clash_account_id', clashAccount.id)
      .eq('status', 'pending')
      .lt('expires_at', now)

    if (deleteExpiredError || deletePendingExpiredError) {
      logger.warn('Refresh verification - failed to delete some expired sessions', {
        userId: user.id,
        clashAccountId: clashAccount.id,
        expiredError: deleteExpiredError?.message,
        pendingError: deletePendingExpiredError?.message,
      })
    }

    const playerResult = await getPlayer(clashAccount.player_tag)
    if (!playerResult.success) {
      return { error: playerResult.error }
    }

    const sessionResult = await createVerificationServerSession(
      clashAccount.id,
      playerResult.data.cards,
      user.id,
      clashAccount.player_tag,
    )

    if (!sessionResult.success) {
      return { error: sessionResult.error }
    }

    logger.info('Refresh verification success', {
      userId: user.id,
      clashAccountId: clashAccount.id,
      sessionId: sessionResult.sessionId,
    })

    return {
      success: true,
      sessionId: sessionResult.sessionId,
      requiredDeck: sessionResult.requiredDeck,
      expiresAt: sessionResult.expiresAt.toISOString(),
      playerTag: clashAccount.player_tag,
      playerName: playerResult.data.name || clashAccount.name || 'Unknown',
    }
  } catch (err) {
    unstable_rethrow(err)

    logger.error('Refresh verification unexpected error', {
      userId: user.id,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}
