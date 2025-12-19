import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'

/**
 * Public API endpoint that returns all valid university email domains.
 * This allows client-side validation without per-keystroke API calls.
 * 
 * Returns a map of email_domain -> university name for instant lookup.
 * 
 * This endpoint is heavily cached since university data changes infrequently:
 * - Revalidates every 1 hour (ISR)
 * - CDN caches for 1 hour with stale-while-revalidate of 1 day
 */

// Next.js ISR: revalidate this route every 1 hour
export const revalidate = 3600

export async function GET() {
    // Use a minimal Supabase client without cookie handling for cacheable public data
    // This avoids the cookie-based server client which makes responses uncacheable
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        )
    }

    // Create a stateless client (no cookie handling) for this public, cacheable request
    const supabase = createServerClient<Database>(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll: () => [],
                setAll: () => { /* no-op for stateless requests */ },
            },
        }
    )

    const { data: universities, error } = await supabase
        .from('universities')
        .select('email_domain, name')
        .order('name')

    if (error) {
        return NextResponse.json(
            { error: 'Failed to fetch universities' },
            { status: 500 }
        )
    }

    // Create a map for O(1) lookup: domain -> university name
    const domainMap: Record<string, string> = {}
    for (const uni of universities || []) {
        domainMap[uni.email_domain.toLowerCase()] = uni.name
    }

    const response = NextResponse.json({
        domains: domainMap,
        // Also return as array for convenience
        universities: universities?.map(u => ({
            email_domain: u.email_domain,
            name: u.name,
        })) || [],
    })

    // Add CDN-friendly cache headers
    // s-maxage: CDN caches for 1 hour
    // stale-while-revalidate: serve stale content while revalidating for up to 1 day
    response.headers.set(
        'Cache-Control',
        'public, s-maxage=3600, stale-while-revalidate=86400'
    )

    return response
}

