/**
 * Type definitions for authentication-related functionality.
 */

import type { ClashRoyaleCard } from './clash-royale'

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

/**
 * Result type for verification initiation server action.
 * 
 * Uses a discriminated union to ensure type safety:
 * - When `success` is true, session data is guaranteed
 * - When `success` is false (error case), only error message is present
 */
export type InitiateVerificationResult =
    | {
        success: true
        sessionId: string
        requiredDeck: ClashRoyaleCard[]
        expiresAt: string // ISO string for serialization across server/client boundary
    }
    | { error: string }

/**
 * Result type for deck verification server action.
 */
export type VerifyDeckResult =
    | { success: true }
    | { error: string; retryAfterSeconds?: number }

/**
 * Pending verification session data.
 * 
 * Returned when a user has an existing verification session in progress.
 * Used to display the required deck on page load.
 */
export type PendingVerificationSession = {
    sessionId: string
    playerTag: string
    playerName: string
    requiredDeck: ClashRoyaleCard[]
    expiresAt: string // ISO string
}
