'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect, unstable_rethrow } from "next/navigation"
import { logger } from "@/lib/logger"
import { ActionResult } from "@/types"
import { getEmailDomain } from "@/lib/auth/email"
import { getUniversityByEmailDomain } from "@/lib/auth/universityEmail.server"
import { validatePasswordStrength, validatePasswordMatch } from "@/lib/auth/validation"

/**
 * Server action to handle user signup.
 * 
 * Creates a new user account with email and password, sends confirmation email,
 * and returns appropriate success/error responses based on the signup flow.
 */
export async function signUpNewUser(formData: FormData): Promise<ActionResult> {
    // Extract and normalize inputs from form data
    const rawEmail = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const email = rawEmail?.trim().toLowerCase()

    // Log the signup attempt for observability
    logger.info('Signup attempt', { email })

    // Validate that required fields are provided
    if (!email || !password) {
        logger.warn('Signup validation failed', {
            email: email ? 'provided' : 'missing',
            password: password ? 'provided' : 'missing',
        })
        return { error: 'Email and password are required' }
    }

    // Server-side password strength validation
    const strengthCheck = validatePasswordStrength(password)
    if (!strengthCheck.isValid) {
        logger.warn('Signup validation failed - weak password', { email })
        return { error: strengthCheck.error || 'Password is too weak' }
    }

    // Server-side password match validation (if confirmPassword provided)
    if (confirmPassword !== undefined && confirmPassword !== null) {
        const matchCheck = validatePasswordMatch(password, confirmPassword)
        if (!matchCheck.isValid) {
            logger.warn('Signup validation failed - passwords do not match', { email })
            return { error: matchCheck.error || 'Passwords do not match' }
        }
    }

    // Extract email domain (part after @)
    const emailDomain = getEmailDomain(email)
    if (!emailDomain) {
        logger.warn('Signup validation failed - invalid email format', { email })
        return { error: 'Invalid email format' }
    }

    // Create Supabase client for server-side operations
    const supabase = await createClient()

    // Validate that the email domain exists in the universities table
    let university = null
    try {
        university = await getUniversityByEmailDomain(supabase, emailDomain)
    } catch (err) {
        logger.warn('Signup validation failed - university domain lookup error', {
            email,
            emailDomain,
            error: err instanceof Error ? err.message : 'Unknown error',
        })
    }

    if (!university) {
        logger.warn('Signup validation failed - email domain not found', {
            email,
            emailDomain,
        })
        return {
            error: 'Your email domain is not associated with a registered university. Please use your university email address.',
        }
    }

    logger.info('Email domain validated', {
        email,
        emailDomain,
        university: university.name,
    })

    try {
        // Attempt to sign up the user with Supabase Auth
        // This will automatically send a confirmation email if email confirmation is enabled
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Fallback redirect URL (used only if using default Supabase email template)
                // With token_hash template, the redirect is handled by /auth/confirm route
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
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