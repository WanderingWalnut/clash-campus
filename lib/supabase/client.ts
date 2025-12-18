/**
 * Browser-side Supabase client (singleton)
 * 
 * Use this in Client Components when you need to:
 * - Set up realtime subscriptions
 * - Make client-side queries that don't need server rendering
 * - Handle client-side auth state changes
 * 
 * This client runs in the browser and automatically manages cookies.
 * Returns the same client instance on every call (singleton pattern).
 * For server-side code, use lib/supabase/server.ts instead.
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 * 
 * const supabase = createClient()
 * 
 * // Type-safe database queries with autocomplete:
 * const { data } = await supabase.from('universities').select('name, short_code')
 * // TypeScript knows the exact shape of 'data' based on your schema
 * ```
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

export function createClient() {
    // Validate environment variables (client-side)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        // Client-side error - log to console since logger is server-only
        console.error('Missing Supabase environment variables', {
            url: supabaseUrl ? 'SET' : 'MISSING',
            key: supabaseKey ? 'SET' : 'MISSING',
        })
        throw new Error(
            'Missing Supabase environment variables. Please check your .env.local file.'
        )
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}