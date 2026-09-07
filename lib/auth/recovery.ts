export const RECOVERY_MAX_AGE_SECONDS = 10 * 60

// Call only with claims whose signature was verified by Supabase getClaims().
export function hasRecentRecovery(
  claims: Record<string, unknown> | undefined,
  userId: string,
  now = Date.now() / 1000,
): boolean {
  if (!claims || claims.sub !== userId) return false
  if (typeof claims.session_id !== 'string' || !claims.session_id) return false
  if (!Array.isArray(claims.amr)) return false
  return claims.amr.some((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return false
    const { method, timestamp } = entry as Record<string, unknown>
    return method === 'recovery' && typeof timestamp === 'number'
      && timestamp <= now && now - timestamp < RECOVERY_MAX_AGE_SECONDS
  })
}
