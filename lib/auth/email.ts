/**
 * Email helpers shared between client + server.
 */

/**
 * Extracts and normalizes the email domain (the part after "@").
 * Returns null if the email is missing a domain.
 */
export function getEmailDomain(email: string): string | null {
    const at = email.lastIndexOf('@')
    if (at < 0) return null

    const domain = email.slice(at + 1).trim().toLowerCase()
    if (!domain) return null

    return domain
}


