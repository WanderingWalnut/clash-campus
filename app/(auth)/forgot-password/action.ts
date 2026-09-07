'use server'

import { redirect } from 'next/navigation'
import { isValidEmailSyntax, normalizeEmail } from '@/lib/auth/behaviour'
import { getSiteUrl } from '@/lib/auth/site-url.server'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = normalizeEmail(String(formData.get('email') ?? ''))
  if (!isValidEmailSyntax(email)) {
    redirect('/forgot-password?error=invalid-email')
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getSiteUrl(),
    })

    if (error) {
      logger.warn('Password recovery request failed', {
        email,
        error: error.message,
        code: error.status,
      })
    }
  } catch (error) {
    logger.error('Password recovery unexpected error', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }

  redirect('/forgot-password?sent=1')
}
