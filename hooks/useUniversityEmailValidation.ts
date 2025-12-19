'use client'

import { useEffect, useState } from 'react'
import { getEmailDomain } from '@/lib/auth/email'

export type EmailValidationStatus = 'idle' | 'typing' | 'valid' | 'invalid'

export interface UniversityEmailValidationResult {
    status: EmailValidationStatus
    error: string | null
    matchedUniversity: string | null
    isValid: boolean
    isLoading: boolean
}

/**
 * Custom hook for validating university email domains.
 * 
 * Fetches all valid university domains once on mount, then provides
 * instant client-side validation as the user types.
 * 
 * @returns Object containing validation state and helper functions
 * 
 * @example
 * ```tsx
 * const { email, setEmail, validation } = useUniversityEmailValidation()
 * 
 * return (
 *   <input
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *   />
 * )
 * ```
 */
export function useUniversityEmailValidation() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<EmailValidationStatus>('idle')
    const [error, setError] = useState<string | null>(null)
    const [matchedUniversity, setMatchedUniversity] = useState<string | null>(null)
    const [validDomains, setValidDomains] = useState<Record<string, string> | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch all valid domains once on mount
    useEffect(() => {
        async function fetchValidDomains() {
            try {
                const res = await fetch('/api/universities/domains')
                if (!res.ok) {
                    console.error('Failed to fetch valid domains')
                    setIsLoading(false)
                    return
                }
                const data = (await res.json()) as { domains: Record<string, string> }
                setValidDomains(data.domains)
            } catch (err) {
                console.error('Error fetching valid domains:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchValidDomains()
    }, [])

    // Client-side validation using cached domains (instant, no API calls)
    function validateEmail(currentEmail: string): {
        valid: boolean
        universityName: string | null
    } {
        if (!currentEmail || !validDomains) {
            return { valid: false, universityName: null }
        }

        const domain = getEmailDomain(currentEmail)
        if (!domain) {
            return { valid: false, universityName: null }
        }

        const universityName = validDomains[domain] || null
        return {
            valid: Boolean(universityName),
            universityName,
        }
    }

    // Instant client-side validation as the user types
    useEffect(() => {
        const trimmed = email.trim()
        if (!trimmed) {
            setStatus('idle')
            setError(null)
            setMatchedUniversity(null)
            return
        }

        // Wait for domains to load before validating
        if (isLoading) {
            setStatus('typing')
            return
        }

        const result = validateEmail(trimmed)
        if (result.valid && result.universityName) {
            setStatus('valid')
            setError(null)
            setMatchedUniversity(result.universityName)
        } else if (trimmed.includes('@')) {
            // Only show error if they've typed an @ (partial email)
            setStatus('invalid')
            setError(
                'Your email domain is not associated with a registered university.'
            )
            setMatchedUniversity(null)
        } else {
            setStatus('typing')
            setError(null)
            setMatchedUniversity(null)
        }
    }, [email, validDomains, isLoading])

    // Validate a specific email (useful for form submission)
    function validate(emailToCheck: string): boolean {
        const result = validateEmail(emailToCheck.trim())
        if (!result.valid) {
            setError(
                'Your email domain is not associated with a registered university.'
            )
            setStatus('invalid')
        }
        return result.valid
    }

    const validation: UniversityEmailValidationResult = {
        status,
        error,
        matchedUniversity,
        isValid: status === 'valid',
        isLoading,
    }

    return {
        email,
        setEmail,
        validation,
        validate,
    }
}

