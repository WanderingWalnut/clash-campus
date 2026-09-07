'use server'

import { isValidEmailSyntax, normalizeEmail } from '@/lib/auth/behaviour'
import { getSiteUrl } from '@/lib/auth/site-url.server'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

const NEUTRAL_MESSAGE = 'If an unconfirmed account exists for that email, a new confirmation link is on its way.'

export async function resendConfirmation(emailValue: string): Promise<ActionResult> {
  const email = normalizeEmail(emailValue)
  if (!isValidEmailSyntax(email)) {
    return { error: 'Enter a valid email address' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: getSiteUrl() },
    })

    if (error) {
      logger.warn('Confirmation resend failed', {
        email,
        error: error.message,
        code: error.status,
      })
    }
  } catch (error) {
    logger.error('Confirmation resend unexpected error', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  return { success: true, message: NEUTRAL_MESSAGE }
}
