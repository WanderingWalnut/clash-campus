import 'server-only'

/**
 * Admin Supabase client (bypasses RLS)
 * 
 * ⚠️ WARNING: This client uses the service role key and bypasses all RLS policies.
 * Only use this when you need to perform operations that require admin privileges.
 * 
 * Use cases:
 * - Writing to tables where users don't have direct permissions (e.g., player_rankings)
 * - System operations that should run regardless of user permissions
 * - Background jobs or scheduled tasks
 * 
 * For normal operations that respect user permissions, use lib/supabase/server.ts instead.
 * 
 * @example
 * ```ts
 * import { createAdminClient } from '@/lib/supabase/admin'
 * 
 * const admin = createAdminClient()
 * // This bypasses RLS - use with caution!
 * await admin.from('player_rankings').upsert({ ... })
 * ```
 */
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type { Database } from '@/lib/supabase/types'

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        logger.error('Missing Supabase service role credentials', {
            url: supabaseUrl ? 'SET' : 'MISSING',
            serviceRoleKey: serviceRoleKey ? 'SET' : 'MISSING',
        })
        throw new Error('Missing Supabase service role credentials')
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    })
}
