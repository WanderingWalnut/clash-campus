import { NextResponse } from 'next/server'

/**
 * API endpoint to get user information from the Clash Royale API.
 * 
 * Player tags start with '#' and must be URL-encoded (e.g., '#2ABC' becomes '%232ABC').
 * 
 * @param request - The request object
 * @returns The user information from Clash Royale API
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const playerTag = searchParams.get('playerTag')
    const apiKey = process.env.CLASH_ROYALE_API_KEY

    if (!playerTag || !apiKey) {
        return NextResponse.json(
            { error: 'Player tag and API key are required' },
            { status: 400 }
        )
    }

    // URL-encode the player tag (e.g., '#2YPQVV8P' becomes '%232YPQVV8P')
    // encodeURIComponent handles the '#' character and any other special characters
    const encodedPlayerTag = encodeURIComponent(playerTag)
    const apiUrl = `https://api.clashroyale.com/v1/players/${encodedPlayerTag}`

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: `Clash Royale API error: ${response.statusText}` },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch player data' },
            { status: 500 }
        )
    }
}