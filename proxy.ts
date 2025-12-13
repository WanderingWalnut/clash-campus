/**
 * Next.js Proxy (formerly Middleware)
 * 
 * Runs on every request before pages render. Automatically refreshes expired
 * Supabase auth tokens and keeps browser/server cookies in sync.
 * 
 * This prevents users from being randomly logged out when tokens expire.
 * The actual session update logic is in lib/supabase/proxy.ts
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
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Image files (svg, png, jpg, jpeg, gif, webp)
         * 
         * We don't need to refresh auth tokens for static assets.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}