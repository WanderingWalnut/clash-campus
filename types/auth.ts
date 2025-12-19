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
 * @example
 * ```ts
 * const result = await signUpNewUser(formData)
 * if ('error' in result) {
 *   // Handle error
 * } else {
 *   // Handle success
 * }
 * ```
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

