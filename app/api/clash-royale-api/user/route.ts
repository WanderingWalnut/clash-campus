import { NextResponse } from 'next/server'
import { getPlayer } from '@/lib/clash-royale'
import { getAuthenticatedUser } from '@/lib/auth/session.server'

/**
 * API endpoint to get a Clash Royale player's profile.
 * 
 * This endpoint requires authentication to prevent abuse.
 * Player tags start with '#' and are automatically normalized.
 * 
 * @example GET /api/clash-royale-api/user?playerTag=%232YPQVV8P
 * 
 * @param request - The request object
 * @returns The player profile or an error
 */
export async function GET(request: Request) {
    // Require authentication to prevent API abuse
    const { user, error: authError } = await getAuthenticatedUser()
    if (authError || !user) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        )
    }

    // Extract player tag from query params
    const { searchParams } = new URL(request.url)
    const playerTag = searchParams.get('playerTag')

    if (!playerTag) {
        return NextResponse.json(
            { error: 'Player tag is required' },
            { status: 400 }
        )
    }

    // Use the Clash Royale client service
    const result = await getPlayer(playerTag)

    if (!result.success) {
        // Determine appropriate status code based on error
        const status = result.error.includes('not found') ? 404
            : result.error.includes('Invalid') ? 400
                : result.error.includes('configuration') ? 500
                    : 502 // Bad Gateway for upstream API errors

        return NextResponse.json(
            { error: result.error },
            { status }
        )
    }

    return NextResponse.json(result.data)
}
