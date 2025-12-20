/**
 * Type definitions for authentication-related functionality.
 */

/**
 * Standard result type for server actions.
 *
 * Server actions should return either a success result with optional message,
 * or an error result with an error message. This provides type safety and
 * consistent error handling across all auth actions.
 *
 */
export type ActionResult =
    | { success: true; message?: string }
    | { error: string }

/**
 * University data returned when validating an email domain.
 * Used for email domain validation during signup.
 */
export type UniversityEmailDomainMatch = {
    id: string
    name: string
    email_domain: string
}

/**
 * Result type for server-side signup validation.
 * Uses a discriminated union to ensure type safety:
 * - When `isValid` is true, `university` and `emailDomain` are guaranteed
 * - When `isValid` is false, `error` is guaranteed
 *
 */
export type SignupValidationResult =
    | {
        isValid: true
        error: null
        university: UniversityEmailDomainMatch
        emailDomain: string
    }
    | {
        isValid: false
        error: string
        university: null
        emailDomain: string | null
    }

