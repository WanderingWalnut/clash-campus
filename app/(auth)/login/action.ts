'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { unstable_rethrow } from "next/navigation"
import { logger } from "@/lib/logger"
import { ActionResult } from "@/types"
import { needsVerification } from "@/lib/auth/verification.server"
import { getAccountDestination, normalizeEmail } from '@/lib/auth/behaviour'

/**
 * Server action to handle user login.
 * 
 * Authenticates user with email and password and redirects to rankings page
 * on successful login. Handles various error cases including invalid credentials,
 * missing fields, and unexpected errors.
 */
export async function logInUser(formData: FormData): Promise<ActionResult> {
    // Extract and normalize email from form data
    const email = normalizeEmail(String(formData.get('email') ?? ''))
    const password = String(formData.get('password') ?? '')
    const requestedPath = String(formData.get('next') ?? '')

    // Log the login attempt for observability
    logger.info('Login attempt', { email })

    // Validate that both email and password are provided
    // This is a guard clause to prevent unnecessary API calls
    if (!email || !password) {
        logger.warn('Login validation failed', {
            email: email ? 'provided' : 'missing',
            password: password ? 'provided' : 'missing',
        })
        return { error: 'Email and password are required' }
    }

    // Create Supabase client for server-side authentication
    const supabase = await createClient()

    try {
        // Attempt to sign in the user with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        // Handle Supabase-specific errors (e.g., invalid credentials, user not found)
        if (error) {
            logger.error('Login Supabase error', {
                error: error.message,
                code: error.status,
                email,
            })
            return { error: 'Email or password is incorrect' }
        }

        // Verify that the user has been logged in and redirect
        if (data.user && data.session) {
            logger.info('Login success', {
                userId: data.user.id,
                email,
            })

            // Check if user needs to complete Clash account verification
            const requiresVerification = await needsVerification(data.user.id)

            redirect(getAccountDestination(!requiresVerification, requestedPath))
        }

        // Fallback success case (shouldn't normally reach here)
        return { success: true }
    } catch (err) {
        // Re-throw Next.js framework-controlled exceptions (redirect, notFound, etc.)
        // This is the Next.js 16 recommended pattern for handling redirects in try/catch
        unstable_rethrow(err)

        // Handle unexpected errors (network issues, server errors, etc.)
        if (err instanceof Error) {
            logger.errorWithStack('Login unexpected error', err, { email })
        } else {
            logger.error('Login unexpected error', {
                error: 'Unknown error',
                email,
            })
        }
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}
