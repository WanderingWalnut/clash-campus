import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import type { Database } from '@/lib/supabase/types'

/**
 * Copy all cookies from one response to another, preserving full cookie options.
 * This is critical for Supabase SSR session management - cookies must retain
 * HttpOnly, Secure, SameSite, Max-Age, and other attributes to avoid:
 * - Session desync between browser and server
 * - "Random logout" issues
 * - Broken cookie chunking cleanup
 */
function copyResponseCookies(from: NextResponse, to: NextResponse): void {
    from.cookies.getAll().forEach(cookie => {
        // NextResponse.cookies.set accepts the full cookie object including options
        // We need to read the Set-Cookie header to get full options since getAll()
        // only returns { name, value }
        to.cookies.set(cookie)
    })
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Validate environment variables before creating client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        logger.error('Missing Supabase environment variables', {
            url: supabaseUrl ? 'SET' : 'MISSING',
            key: supabaseKey ? 'SET' : 'MISSING',
            path: request.nextUrl.pathname,
        })

        // Return error response instead of crashing
        return NextResponse.json(
            { error: 'Server configuration error: Missing Supabase credentials' },
            { status: 500 }
        )
    }

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient<Database>(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                },
            },
        }
    )

    // Do not run code between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getClaims() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const { data } = await supabase.auth.getClaims()

    const user = data?.claims

    // Public routes that don't require authentication
    // - Landing, auth flows, and public leaderboard routes
    // - /rankings is public for signed-out users (campus leaderboard)
    // - Player-specific data is protected by RLS policies, not route protection
    // - /forgot-password is public so users can request a password reset
    const publicRoutes = ['/', '/login', '/signup', '/auth', '/rankings', '/forgot-password']
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
    )

    if (!user && !isPublicRoute) {
        // Redirect unauthenticated users to login (except on public pages)
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        const redirectResponse = NextResponse.redirect(url)
        // IMPORTANT: Copy Supabase cookies to redirect response to maintain session state
        copyResponseCookies(supabaseResponse, redirectResponse)
        return redirectResponse
    }

    // Redirect authenticated users away from auth pages to their profile
    const authRedirectRoutes = ['/login', '/signup']
    const isAuthRedirectRoute = authRedirectRoutes.some(route =>
        request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
    )

    if (user && isAuthRedirectRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/profile'
        const redirectResponse = NextResponse.redirect(url)
        // IMPORTANT: Copy Supabase cookies with full options to maintain session state
        copyResponseCookies(supabaseResponse, redirectResponse)
        return redirectResponse
    }

    // Routes that don't require Clash account verification
    // - /verify is where users go to verify their account
    // - /reset-password is accessed after clicking the password reset email link
    // - Public routes stay exempt, except /rankings which requires verification when signed in
    const verificationExemptRoutes = ['/verify', '/reset-password']
    const isRankingsRoute =
        request.nextUrl.pathname === '/rankings'
        || request.nextUrl.pathname.startsWith('/rankings/')
    const isVerificationExempt = verificationExemptRoutes.some(route =>
        request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
    ) || (isPublicRoute && !isRankingsRoute)

    // Check verification status for authenticated users on non-exempt routes
    if (user && !isVerificationExempt) {
        // Query clash_accounts to check if user is verified
        const { data: clashAccount } = await supabase
            .from('clash_accounts')
            .select('verified')
            .eq('profile_id', user.sub as string)
            .maybeSingle()

        // If no account or not verified, redirect to verification page
        if (!clashAccount || !clashAccount.verified) {
            const url = request.nextUrl.clone()
            url.pathname = '/verify'
            const redirectResponse = NextResponse.redirect(url)
            // IMPORTANT: Copy Supabase cookies with full options to maintain session state
            copyResponseCookies(supabaseResponse, redirectResponse)
            return redirectResponse
        }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
