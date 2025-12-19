import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { UniversityEmailDomainMatch } from '@/types/auth'

/**
 * Returns the matching university row for a given email domain, or null if none found.
 *
 * Note: uses maybeSingle() so "not found" is not treated as an error.
 */
export async function getUniversityByEmailDomain(
    supabase: SupabaseClient<Database>,
    emailDomain: string
): Promise<UniversityEmailDomainMatch | null> {
    const { data, error } = await supabase
        .from('universities')
        .select('id, name, email_domain')
        .eq('email_domain', emailDomain)
        .maybeSingle()

    if (error) throw error
    return data
}


