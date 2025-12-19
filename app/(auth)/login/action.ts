'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { logger } from "@/lib/logger"
import { ActionResult } from "@/types"

/**
 * Server action to handle user login.
 * 
 * Authenticates user with email and password and redirects to rankings page
 * on successful login. Handles various error cases including invalid credentials,
 * missing fields, and unexpected errors.
 */
export async function logInUser(formData: FormData): Promise<ActionResult> {
    // Extract email and password from the form data
    const email = formData.get("email") as string
    const password = formData.get("password") as string

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
            return { error: error.message }
        }

        // Verify that the user has been logged in and redirect
        if (data.user && data.session) {
            logger.info('Login success', {
                userId: data.user.id,
                email,
            })
            redirect('/rankings')
        }

        // Fallback success case (shouldn't normally reach here)
        return { success: true }
    } catch (err) {
        // Re-throw redirect errors - Next.js uses these internally for navigation (not an actual error)
        if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
            throw err
        }

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