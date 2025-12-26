import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/session.server'
import { getUserProfile } from '@/lib/profile/profile.server'

function withCache(response: NextResponse) {
  response.headers.set(
    'Cache-Control',
    'private, max-age=30, stale-while-revalidate=60'
  )
  return response
}

export async function GET() {
  const { user, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return withCache(
      NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    )
  }

  const result = await getUserProfile(user.id)

  if (result.status === 'missing-profile') {
    return withCache(
      NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    )
  }

  if (result.status === 'missing-university') {
    return withCache(
      NextResponse.json(
        { error: 'User profile missing university association' },
        { status: 403 }
      )
    )
  }

  if (result.status === 'missing-clash-account') {
    return withCache(
      NextResponse.json({ error: 'Clash account not found' }, { status: 404 })
    )
  }

  if (result.status === 'error') {
    return withCache(
      NextResponse.json({ error: result.message }, { status: 500 })
    )
  }

  return withCache(NextResponse.json(result.profile))
}
