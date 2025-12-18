/**
 * Next.js 16 Proxy (formerly Middleware)
 * 
 * Runs on every request before pages render. Automatically refreshes expired
 * Supabase auth tokens and keeps browser/server cookies in sync.
 * 
 * This prevents users from being randomly logged out when tokens expire.
 * The actual session update logic is in lib/supabase/proxy.ts
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */
import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes - they handle their own auth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Image files (svg, png, jpg, jpeg, gif, webp)
         * 
         * Also excludes Next.js prefetch requests to avoid unnecessary
         * session refresh and confusing "unauthenticated prefetch" behavior.
         * 
         * We don't need to refresh auth tokens for static assets or API routes.
         */
        {
            source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
}
