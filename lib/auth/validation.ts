/**
 * Client-side validation utilities for authentication forms.
 */

import { getEmailDomain } from '@/lib/auth/email'

export interface ValidationResult {
    isValid: boolean;
    error: string | null;
}

/**
 * Validates password and confirm password match.
 */
export function validatePasswordMatch(
    password: string,
    confirmPassword: string
): ValidationResult {
    if (password !== confirmPassword) {
        return {
            isValid: false,
            error: 'Passwords do not match',
        };
    }

    return { isValid: true, error: null };
}

/**
 * Validates password meets minimum requirements.
 */
export function validatePasswordStrength(password: string): ValidationResult {
    if (password.length < 8) {
        return {
            isValid: false,
            error: 'Password must be at least 8 characters',
        };
    }

    return { isValid: true, error: null };
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
    if (!emailDomain) {
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

