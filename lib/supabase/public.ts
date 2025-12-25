import 'server-only'

/**
 * Stateless Supabase client for public, cacheable requests.
 *
 * Use this in Route Handlers that must remain shared-cache friendly.
 * It avoids cookies so responses can be cached by the CDN.
 */
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import type { Database } from '@/lib/supabase/types'

export function createPublicClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        logger.error('Missing Supabase environment variables in public client', {
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
                getAll: () => [],
                setAll: () => { /* no-op for cacheable public data */ },
            },
        }
    )
}
