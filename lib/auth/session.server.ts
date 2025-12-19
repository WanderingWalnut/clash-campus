import 'server-only'

/**
 * Session utilities for server-side authentication.
 * 
 * Provides reusable helpers for getting the authenticated user
 * in Server Components, Server Actions, and Route Handlers.
 * 
 * IMPORTANT: Always use getUser() instead of getSession() for security.
 * getUser() validates the Auth token on the server, while getSession()
 * only reads the local session which could be tampered with.
 * 
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export interface AuthenticatedUser {
    user: User
}

export interface AuthResult {
    user: User | null
    error: Error | null
}

/**
 * Get the authenticated user from the current session.
 * 
 * This validates the Auth token on the server for security.
 * Use this in Server Components, Server Actions, and Route Handlers.
 * 
 * @returns The authenticated user or null if not authenticated
 * 
 * @example
 * ```ts
 * const { user, error } = await getAuthenticatedUser()
 * if (!user) {
 *   redirect('/login')
 * }
 * ```
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
        return { user: null, error }
    }

    return { user: data.user, error: null }
}

/**
 * Require authentication - throws redirect if not authenticated.
 * 
 * Convenience helper that gets the user and handles the redirect
 * for protected pages/actions.
 * 
 * @returns The authenticated user (never null)
 * @throws Redirect to /login if not authenticated
 * 
 * @example
 * ```ts
 * const user = await requireAuth()
 * // user is guaranteed to exist here
 * ```
 */
export async function requireAuth(): Promise<User> {
    const { user, error } = await getAuthenticatedUser()

    if (error || !user) {
        redirect('/login')
    }

    return user
}

