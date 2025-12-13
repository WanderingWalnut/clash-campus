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
 * const { data } = await supabase.from('table').select()
 * ```
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
}