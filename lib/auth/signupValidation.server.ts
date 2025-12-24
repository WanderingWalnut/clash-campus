import 'server-only'

import type { SignupValidationResult, UniversityEmailDomainMatch } from '@/types/auth'
import { getEmailDomain } from '@/lib/auth/email'
import { getUniversityByEmailDomain } from '@/lib/auth/universityEmail.server'
import { validatePasswordStrength, validatePasswordMatch } from '@/lib/auth/validation'

/**
 * Server-side validation for signup form data.
 * 
 * Validates required fields, password strength, password match, email format,
 * and university domain registration.
 * 
 * @param email - Normalized email address
 * @param password - User password
 * @param confirmPassword - Password confirmation (optional)
 * @returns Validation result with error message or validated university
 */
export async function validateSignupInput(
    email: string | null | undefined,
    password: string | null | undefined,
    confirmPassword: string | null | undefined,
): Promise<SignupValidationResult> {
    // Validate required fields
    if (!email || !password) {
        return {
            isValid: false,
            error: 'Email and password are required',
            emailDomain: null,
            university: null,
        }
    }

    // Validate password strength
    const strengthCheck = validatePasswordStrength(password)
    if (!strengthCheck.isValid) {
        return {
            isValid: false,
            error: strengthCheck.error || 'Password is too weak',
            emailDomain: null,
            university: null,
        }
    }

    // Validate password match (if confirmPassword provided)
    if (confirmPassword !== undefined && confirmPassword !== null) {
        const matchCheck = validatePasswordMatch(password, confirmPassword)
        if (!matchCheck.isValid) {
            return {
                isValid: false,
                error: matchCheck.error || 'Passwords do not match',
                emailDomain: null,
                university: null,
            }
        }
    }

    // Extract and validate email domain
    const emailDomain = getEmailDomain(email)
    if (!emailDomain) {
        return {
            isValid: false,
            error: 'Invalid email format',
            emailDomain: null,
            university: null,
        }
    }

    // Validate university domain exists in database
    let university: UniversityEmailDomainMatch | null = null
    try {
        university = await getUniversityByEmailDomain(emailDomain)
    } catch {
        // Return error if database lookup fails
        return {
            isValid: false,
            error: 'Unable to verify university email domain. Please try again.',
            emailDomain,
            university: null,
        }
    }

    if (!university) {
        return {
            isValid: false,
            error: 'Your email domain is not associated with a registered university. Please use your university email address.',
            emailDomain,
            university: null,
        }
    }

    // All validations passed
    return {
        isValid: true,
        error: null,
        emailDomain,
        university,
    }
}

