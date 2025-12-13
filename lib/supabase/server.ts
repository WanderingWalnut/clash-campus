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
 * const supabase = await createClient()
 * const { data: { user } } = await supabase.auth.getUser()
 * ```
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
