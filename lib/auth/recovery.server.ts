import 'server-only'

export const RECOVERY_COOKIE_NAME = 'clash-campus-recovery'

export const RECOVERY_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 10 * 60,
}
