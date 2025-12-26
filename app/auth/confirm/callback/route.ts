/**
 * Email confirmation callback.
 *
 * Exchanges the auth code for a session cookie, then redirects the user
 * to the next page in the flow.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { needsVerification } from '@/lib/auth/verification.server'

const DEFAULT_NEXT = '/rankings'

function buildRedirectUrl(request: NextRequest, nextPath: string) {
    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = nextPath
    redirectTo.search = ''
    return redirectTo
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
        logger.warn('Email confirmation callback missing code')
        const redirectTo = buildRedirectUrl(request, '/auth/auth-code-error')
        return NextResponse.redirect(redirectTo)
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        logger.error('Email confirmation code exchange failed', {
            error: error.message,
            code: error.status,
        })
        const redirectTo = buildRedirectUrl(request, '/auth/auth-code-error')
        return NextResponse.redirect(redirectTo)
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const requiresVerification = await needsVerification(user.id)
        if (requiresVerification) {
            const redirectTo = buildRedirectUrl(request, '/verify')
            return NextResponse.redirect(redirectTo)
        }
    }

    const redirectTo = buildRedirectUrl(request, DEFAULT_NEXT)
    return NextResponse.redirect(redirectTo)
}
