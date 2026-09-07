'use server'

import { redirect } from 'next/navigation'
import { validatePasswordMatch, validatePasswordStrength } from '@/lib/auth/behaviour'
import { getRecoveryUser } from '@/lib/auth/recovery.server'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const password = String(formData.get('password') ?? '')
  const confirmation = String(formData.get('confirmPassword') ?? '')
  const strength = validatePasswordStrength(password)
  if (!strength.isValid) return { error: strength.error }

  const match = validatePasswordMatch(password, confirmation)
  if (!match.isValid) return { error: match.error }

  const supabase = await createClient()
  const user = await getRecoveryUser(supabase)

  if (!user) {
    return { error: 'This recovery link is invalid or expired. Request a new link.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    logger.error('Password reset update failed', {
      userId: user.id,
      error: updateError.message,
      code: updateError.status,
    })
    return { error: 'Password could not be updated. Request a new recovery link.' }
  }

  const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' })
  if (signOutError) {
    logger.error('Password reset global sign out failed', {
      userId: user.id,
      error: signOutError.message,
      code: signOutError.status,
    })
    return { error: 'Password updated, but not all sessions could be closed. Request a new recovery link.' }
  }

  redirect('/login?reset=success')
}
