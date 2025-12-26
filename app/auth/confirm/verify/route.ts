/**
 * Email Confirmation Route Handler (POST-only)
 *
 * Verifies the token_hash sent from the confirm page and exchanges it for a session.
 * Keeping this as POST prevents email scanners from consuming one-time tokens on GET.
 */
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { needsVerification } from '@/lib/auth/verification.server'

const DEFAULT_NEXT = '/rankings'

function buildRedirectUrl(request: NextRequest, nextPath: string) {
    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = nextPath
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')
    redirectTo.searchParams.delete('next')
    return redirectTo
}

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const tokenHash = (formData.get('token_hash') as string | null) ?? ''
    const type = (formData.get('type') as EmailOtpType | null) ?? null
    const nextPath = (formData.get('next') as string | null) ?? DEFAULT_NEXT

    // Guard against missing inputs from the form.
    if (!tokenHash || !type) {
        logger.warn('Email confirmation missing parameters', {
            hasToken: !!tokenHash,
            hasType: !!type,
        })
        const redirectTo = buildRedirectUrl(request, DEFAULT_NEXT)
        redirectTo.pathname = '/auth/auth-code-error'
        return NextResponse.redirect(redirectTo)
    }

    const redirectTo = buildRedirectUrl(request, nextPath)
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
    })

    if (!error) {
        logger.info('Email confirmation success', { type, next: nextPath })

        // Check if user needs to complete Clash account verification.
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const requiresVerification = await needsVerification(user.id)

            if (requiresVerification) {
                logger.info('Email confirmed, redirect to verify', { userId: user.id })
                redirectTo.pathname = '/verify'
                return NextResponse.redirect(redirectTo)
            }
        }

        return NextResponse.redirect(redirectTo)
    }

    logger.error('Email confirmation error', {
        error: error.message,
        code: error.status,
        type,
    })

    // Fall back to the auth error page with instructions.
    redirectTo.pathname = '/auth/auth-code-error'
    return NextResponse.redirect(redirectTo)
}
