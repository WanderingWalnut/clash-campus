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

    // Redirect the user to Supabase's confirmation URL to finish the flow.
    return NextResponse.redirect(confirmationUrl)
}
