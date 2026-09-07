export const PASSWORD_MIN_LENGTH = 8

const LOCAL_ORIGIN = 'https://clashcampus.local'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const AUTH_ENTRY_PATHS = ['/login', '/signup']

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidEmailSyntax(value: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(value))
}

export function validatePasswordStrength(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH
    ? { isValid: true as const, error: null }
    : {
        isValid: false as const,
        error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      }
}

export function validatePasswordMatch(password: string, confirmation: string) {
  return password === confirmation
    ? { isValid: true as const, error: null }
    : { isValid: false as const, error: 'Passwords do not match' }
}

export function getSafeNextPath(value: string | null | undefined): string | null {
  const candidate = value?.trim()
  if (
    !candidate
    || !candidate.startsWith('/')
    || candidate.startsWith('//')
    || candidate.includes('\\')
  ) {
    return null
  }

  const url = new URL(candidate, LOCAL_ORIGIN)
  if (AUTH_ENTRY_PATHS.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) {
    return null
  }

  return url.origin === LOCAL_ORIGIN
    ? `${url.pathname}${url.search}${url.hash}`
    : null
}

export function getAccountDestination(
  isClashAccountVerified: boolean,
  requestedPath?: string | null,
): string {
  return getSafeNextPath(requestedPath)
    ?? (isClashAccountVerified ? '/rankings' : '/verify')
}

export function getLoginPath(pathname: string, search = ''): string {
  const nextPath = getSafeNextPath(`${pathname}${search}`)
  return nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login'
}
