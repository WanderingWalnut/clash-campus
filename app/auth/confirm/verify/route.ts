/**
 * Email Confirmation Route Handler (POST-only)
 *
 * Verifies the token hash only after a user-initiated POST so email scanners
 * cannot consume one-time links on GET.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { needsVerification } from '@/lib/auth/verification.server'
import {
    RECOVERY_COOKIE_NAME,
    RECOVERY_COOKIE_OPTIONS,
} from '@/lib/auth/recovery.server'

type EmailOtpType =
    | 'email'
    | 'signup'
    | 'invite'
    | 'magiclink'
    | 'recovery'
    | 'email_change'

const ALLOWED_TYPES = new Set<EmailOtpType>([
    'email',
    'signup',
    'invite',
    'magiclink',
    'recovery',
    'email_change',
])

function normalizeOtpType(value: FormDataEntryValue | null): EmailOtpType | null {
    if (typeof value !== 'string') {
        return null
    }

    const candidate = value.trim()
    if (!candidate) {
        return null
    }

    const normalized = candidate as EmailOtpType
    return ALLOWED_TYPES.has(normalized) ? normalized : null
}

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const tokenHash = (formData.get('token_hash') as string | null)?.trim()
    const otpType = normalizeOtpType(formData.get('type'))

    // Guard against missing inputs from the form.
    if (!tokenHash || !otpType) {
        logger.warn('Email confirmation missing required fields', {
            hasTokenHash: !!tokenHash,
            hasType: !!otpType,
        })
        return NextResponse.redirect(
            new URL('/auth/auth-code-error', request.url)
        )
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
    })

    if (error) {
        logger.error('Email confirmation verifyOtp failed', {
            error: error.message,
            code: error.status,
            type: otpType,
        })
        return NextResponse.redirect(
            new URL(
                otpType === 'recovery'
                    ? '/auth/auth-code-error?flow=recovery'
                    : '/auth/auth-code-error',
                request.url,
            )
        )
    }

    if (otpType === 'recovery') {
        const user = data.user ?? (await supabase.auth.getUser()).data.user
        if (!user) {
            return NextResponse.redirect(
                new URL('/auth/auth-code-error', request.url)
            )
        }

        const response = NextResponse.redirect(
            new URL('/reset-password', request.url),
            { status: 303 }
        )
        response.cookies.set(
            RECOVERY_COOKIE_NAME,
            user.id,
            RECOVERY_COOKIE_OPTIONS,
        )
        return response
    }

    const user = data.user ?? (await supabase.auth.getUser()).data.user

    if (!user) {
        logger.warn('Email confirmation succeeded without user', {
            type: otpType,
        })
        return NextResponse.redirect(
            new URL('/auth/auth-code-error', request.url)
        )
    }

    const requiresVerification = await needsVerification(user.id)
    const nextPath = requiresVerification ? '/verify' : '/rankings'
    return NextResponse.redirect(new URL(nextPath, request.url), {
        status: 303,
    })
}
