/**
 * Email Confirmation Route Handler
 * 
 * Handles email confirmation links (signup verification, password reset, etc.).
 * Uses verifyOtp to exchange the token_hash for a session.
 * 
 * IMPORTANT: To use this handler, update your Supabase email templates:
 * 1. Go to Supabase Dashboard > Authentication > Email Templates
 * 2. In the "Confirm signup" template, replace:
 *    {{ .ConfirmationURL }}
 *    with:
 *    {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 * 
 * This redirects email confirmations through this server-side handler
 * instead of directly to Supabase.
 */
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/rankings'

    // Create redirect URL, cleaning up query params
    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')
    redirectTo.searchParams.delete('next')

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            logger.info('Email confirmation success', { type, next })
            return NextResponse.redirect(redirectTo)
        } else {
            logger.error('Email confirmation error', {
                error: error.message,
                code: error.status,
                type,
            })
        }
    } else {
        logger.warn('Email confirmation missing parameters', {
            hasToken: !!token_hash,
            hasType: !!type,
        })
    }

    // Return the user to an error page with instructions
    redirectTo.pathname = '/auth/auth-code-error'
    return NextResponse.redirect(redirectTo)
}

