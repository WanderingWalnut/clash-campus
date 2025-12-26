/**
 * Email Confirmation Route Handler (POST-only)
 *
 * Redirects to the Supabase confirmation URL only after a user-initiated POST.
 * Keeping this as POST prevents email scanners from consuming one-time links on GET.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

function parseConfirmationUrl(value: string) {
    try {
        return new URL(value)
    } catch {
        return null
    }
}

function isAllowedConfirmationUrl(url: URL) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
        // If env is missing, only allow Supabase-hosted verification URLs.
        return url.hostname.endsWith('.supabase.co')
    }

    const expectedHost = new URL(supabaseUrl).host
    return url.host === expectedHost
}

function fixRedirectTo(confirmationUrl: URL, request: NextRequest): URL {
    const redirectTo = confirmationUrl.searchParams.get('redirect_to')

    if (!redirectTo) {
        // No redirect_to parameter, add it
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`
        confirmationUrl.searchParams.set('redirect_to', `${siteUrl}/auth/confirm/callback`)
        return confirmationUrl
    }

    try {
        const redirectUrl = new URL(redirectTo)

        // Check if redirect_to is missing the callback path
        if (redirectUrl.pathname === '/' || !redirectUrl.pathname.endsWith('/auth/confirm/callback')) {
            // Fix the redirect_to to point to the callback route
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                `${request.nextUrl.protocol}//${request.nextUrl.host}`
            const fixedRedirect = `${siteUrl}/auth/confirm/callback`
            confirmationUrl.searchParams.set('redirect_to', fixedRedirect)
        }
    } catch {
        // Invalid redirect_to URL, replace it
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
            `${request.nextUrl.protocol}//${request.nextUrl.host}`
        confirmationUrl.searchParams.set('redirect_to', `${siteUrl}/auth/confirm/callback`)
    }

    return confirmationUrl
}

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const confirmationUrlValue =
        (formData.get('confirmation_url') as string | null) ?? ''

    // Guard against missing inputs from the form.
    if (!confirmationUrlValue) {
        logger.warn('Email confirmation missing confirmation_url', {
            hasConfirmationUrl: !!confirmationUrlValue,
        })
        return NextResponse.redirect(
            new URL('/auth/auth-code-error', request.url)
        )
    }

    const confirmationUrl = parseConfirmationUrl(confirmationUrlValue)

    if (!confirmationUrl || !isAllowedConfirmationUrl(confirmationUrl)) {
        logger.warn('Email confirmation invalid confirmation_url', {
            confirmationUrl: confirmationUrlValue,
        })
        return NextResponse.redirect(
            new URL('/auth/auth-code-error', request.url)
        )
    }

    // Fix the redirect_to parameter if it's missing the callback path.
    // This handles cases where Supabase uses the Site URL from dashboard instead of emailRedirectTo.
    const fixedUrl = fixRedirectTo(confirmationUrl, request)

    // Redirect the user to Supabase's confirmation URL to finish the flow.
    // Use 303 to ensure the browser performs a GET.
    return NextResponse.redirect(fixedUrl, { status: 303 })
}
