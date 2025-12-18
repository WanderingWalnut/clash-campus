/**
 * OAuth/PKCE Callback Route Handler
 * 
 * Handles the callback from OAuth providers (Google, GitHub, etc.) or PKCE flows.
 * Exchanges the authorization code for a user session and redirects appropriately.
 * 
 * This is different from /auth/confirm which handles email OTP verification.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // if "next" is in param, use it as the redirect URL (must be relative for security)
    let next = searchParams.get('next') ?? '/rankings'
    if (!next.startsWith('/')) {
        // if "next" is not a relative URL, use the default
        next = '/rankings'
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            logger.info('OAuth callback success', { next })
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                // In development, no load balancer, so use origin directly
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                // In production with load balancer, use the forwarded host
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            logger.error('OAuth callback error', {
                error: error.message,
                code: error.status,
            })
        }
    } else {
        logger.warn('OAuth callback missing code parameter')
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
