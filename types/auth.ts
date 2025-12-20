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

/**
 * Result type for server-side signup validation.
 * 
 * Uses a discriminated union to ensure type safety:
 * - When `isValid` is true, `university` and `emailDomain` are guaranteed
 * - When `isValid` is false, `error` is guaranteed
 * 
 * @example
 * ```ts
 * const validation = await validateSignupInput(email, password, confirmPassword, supabase)
 * if (validation.isValid) {
 *   // TypeScript knows university and emailDomain exist here
 *   console.log(validation.university.name)
 * } else {
 *   // TypeScript knows error exists here
 *   console.error(validation.error)
 * }
 * ```
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

