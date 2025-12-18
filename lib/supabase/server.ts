/**
 * Server-side Supabase client
 * 
 * Use this in Server Components, Server Actions, and Route Handlers.
 * 
 * This client:
 * - Reads auth cookies from the request
 * - Can write cookies back (though Server Components may fail silently)
 * - Automatically includes the user's auth token in all requests
 * - Respects RLS policies based on the authenticated user
 * 
 * Note: The proxy (proxy.ts) handles token refresh automatically.
 * If cookie writes fail here, the proxy will handle it on the next request.
 * 
 * @example
 * ```ts
 * import { createClient } from '@/lib/supabase/server'
 * 
 * const supabase = await createClient()
 * const { data: { user } } = await supabase.auth.getUser()
 * 
 * // Type-safe database queries with autocomplete:
 * const { data } = await supabase.from('universities').select('name, short_code')
 * // data type is automatically inferred from Database types
 * ```
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'
import type { Database } from '@/lib/supabase/types'

export async function createClient() {
    const cookieStore = await cookies()

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        logger.error('Missing Supabase environment variables in server client', {
            url: supabaseUrl ? 'SET' : 'MISSING',
            key: supabaseKey ? 'SET' : 'MISSING',
        })
        throw new Error(
            'Missing Supabase environment variables. Please check your env vars.'
        )
    }

    return createServerClient<Database>(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be safely ignored because the proxy (proxy.ts)
                        // handles token refresh on every request.
                    }
                },
            },
        }
    )
}
