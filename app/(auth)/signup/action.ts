'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect, unstable_rethrow } from "next/navigation"
import { headers } from "next/headers"
import { logger } from "@/lib/logger"
import { ActionResult } from "@/types"
import { validateSignupInput } from "@/lib/auth/signupValidation.server"

/**
 * Builds the callback URL for email confirmation redirects.
 * 
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (should be set in production)
 * 2. NEXT_PUBLIC_VERCEL_URL (automatically set by Vercel)
 * 3. Request headers (fallback for dynamic detection)
 * 4. localhost (development fallback)
 */
async function getCallbackUrl(): Promise<string> {
    // Prefer explicitly set site URL
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm/callback`
    }

    // Use Vercel's automatically provided URL (available at build/runtime)
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        // Vercel URL might not include protocol
        const url = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
        return `${url}/auth/confirm/callback`
    }

    // Fallback: build from request headers (for dynamic detection)
    try {
        const headerList = await headers()
        const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
        const protocol = headerList.get('x-forwarded-proto') ?? 'https'

        if (host) {
            return `${protocol}://${host}/auth/confirm/callback`
        }
    } catch {
        // Headers not available (shouldn't happen in server actions, but safe fallback)
    }

    // Development fallback
    return 'http://localhost:3000/auth/confirm/callback'
}

/**
 * Server action to handle user signup.
 * 
 * Creates a new user account with email and password, sends confirmation email,
 * and returns appropriate success/error responses based on the signup flow.
 */
export async function signUpNewUser(formData: FormData): Promise<ActionResult> {
    // Extract and normalize inputs from form data
    const email = (formData.get("email") as string)?.trim().toLowerCase()
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Log the signup attempt for observability
    logger.info('Signup attempt', { email })

    // Validate all signup inputs (required fields, password strength, email format, university domain)
    const validation = await validateSignupInput(email, password, confirmPassword)

    if (!validation.isValid) {
        // Log validation failure with context
        logger.warn('Signup validation failed', {
            email,
            emailDomain: validation.emailDomain,
            error: validation.error,
        })
        return { error: validation.error || 'Validation failed' }
    }

    // Validation passed - extract validated data
    // TypeScript now knows university and emailDomain are guaranteed when isValid is true
    const { university, emailDomain } = validation

    logger.info('Email domain validated', {
        email,
        emailDomain,
        university: university.name,
    })

    const supabase = await createClient()

    try {
        // Build the callback URL dynamically to handle Vercel preview deployments
        const callbackUrl = await getCallbackUrl()

        logger.info('Signup with email redirect', {
            email,
            callbackUrl,
            hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
            hasVercelUrl: !!process.env.NEXT_PUBLIC_VERCEL_URL,
        })

        // Attempt to sign up the user with Supabase Auth
        // This will automatically send a confirmation email if email confirmation is enabled
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Redirect back to the callback after Supabase confirms the email.
                // The callback exchanges the auth code for a session cookie.
                emailRedirectTo: callbackUrl,
            },
        })

        // Handle Supabase-specific errors (e.g., email already exists, weak password)
        if (error) {
            logger.error('Signup Supabase error', {
                error: error.message,
                code: error.status,
                email,
            })
            return { error: error.message }
        }

        // Case 1: Email confirmation is required (default behavior)
        // User account is created but not activated until they click the email link
        if (data.user && !data.session) {
            logger.info('Signup success - email confirmation required', {
                userId: data.user.id,
                email,
            })
            return {
                success: true,
                message: 'Please check your email to confirm your account before signing in.',
            }
        }

        // Case 2: Email confirmation is disabled
        // User is immediately signed in and redirected to rankings
        if (data.session) {
            logger.info('Signup success - immediate signin', {
                userId: data.user?.id,
                email,
            })
            redirect('/rankings')
        }

        // Fallback success case
        return { success: true }
    } catch (err) {
        // Re-throw Next.js framework-controlled exceptions (redirect, notFound, etc.)
        // This is the Next.js 16 recommended pattern for handling redirects in try/catch
        unstable_rethrow(err)

        // Handle unexpected errors (network issues, server errors, etc.)
        if (err instanceof Error) {
            logger.errorWithStack('Signup unexpected error', err, { email })
        } else {
            logger.error('Signup unexpected error', {
                error: 'Unknown error',
                email,
            })
        }
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
