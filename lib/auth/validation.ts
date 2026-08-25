/**
 * Client-side validation utilities for authentication forms.
 */

import { getEmailDomain } from '@/lib/auth/email'
import {
    isValidEmailSyntax,
    validatePasswordMatch,
    validatePasswordStrength,
} from '@/lib/auth/behaviour'

export interface ValidationResult {
    isValid: boolean;
    error: string | null;
}

/**
 * Validates signup form data.
 */
export function validateSignupForm(
    email: string,
    password: string,
    confirmPassword: string
): ValidationResult {
    // Basic email format (must include a domain)
    const emailDomain = getEmailDomain(email)
    if (!emailDomain || !isValidEmailSyntax(email)) {
        return { isValid: false, error: 'Please enter a valid email address' }
    }

    // Check password strength
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.isValid) {
        return strengthCheck;
    }

    // Check passwords match
    const matchCheck = validatePasswordMatch(password, confirmPassword);
    if (!matchCheck.isValid) {
        return matchCheck;
    }

    return { isValid: true, error: null };
}
