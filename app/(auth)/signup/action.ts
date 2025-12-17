'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { logger } from "@/lib/logger"
import { ActionResult } from "@/types"

/**
 * Server action to handle user signup.
 * 
 * Creates a new user account with email and password, sends confirmation email,
 * and returns appropriate success/error responses based on the signup flow.
 */
export async function signUpNewUser(formData: FormData): Promise<ActionResult> {
    // Extract email and password from form data
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Log the signup attempt for observability
    logger.info('Signup attempt', { email })

    // Validate that both email and password are provided
    // This is a guard clause to prevent unnecessary API calls
    if (!email || !password) {
        logger.warn('Signup validation failed', {
            email: email ? 'provided' : 'missing',
            password: password ? 'provided' : 'missing',
        })
        return { error: 'Email and password are required' }
    }

    // Create Supabase client for server-side operations
    const supabase = await createClient()

    try {
        // Attempt to sign up the user with Supabase Auth
        // This will automatically send a confirmation email if email confirmation is enabled
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // URL to redirect to after user clicks confirmation link in email
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
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