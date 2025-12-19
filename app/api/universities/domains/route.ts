import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Public API endpoint that returns all valid university email domains.
 * This allows client-side validation without per-keystroke API calls.
 * 
 * Returns a map of email_domain -> university name for instant lookup.
 */
export async function GET() {
    const supabase = await createClient()

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

    return NextResponse.json({
        domains: domainMap,
        // Also return as array for convenience
        universities: universities?.map(u => ({
            email_domain: u.email_domain,
            name: u.name,
        })) || [],
    })
}

