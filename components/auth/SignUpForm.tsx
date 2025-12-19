'use client';

import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { signUpNewUser } from '@/app/(auth)/signup/action';
import { SignUpSuccessScreen } from './SignUpSuccessScreen';
import { validateSignupForm } from '@/lib/auth/validation';
import { useEffect, useState } from 'react';
import { getEmailDomain } from '@/lib/auth/email';

/**
 * Sign up form component.
 * Handles user registration with email and password validation.
 */
export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    'idle' | 'typing' | 'valid' | 'invalid'
  >('idle');
  const [matchedUniversity, setMatchedUniversity] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  // Cache of valid domains: domain -> university name
  const [validDomains, setValidDomains] = useState<Record<string, string> | null>(null);
  const [domainsLoading, setDomainsLoading] = useState(true);

  // Fetch all valid domains once on mount
  useEffect(() => {
    async function fetchValidDomains() {
      try {
        const res = await fetch('/api/universities/domains')
        if (!res.ok) {
          console.error('Failed to fetch valid domains')
          setDomainsLoading(false)
          return
        }
        const data = (await res.json()) as { domains: Record<string, string> }
        setValidDomains(data.domains)
      } catch (err) {
        console.error('Error fetching valid domains:', err)
      } finally {
        setDomainsLoading(false)
      }
    }
    fetchValidDomains()
  }, [])

  // Client-side validation using cached domains (instant, no API calls)
  function validateUniversityEmail(currentEmail: string): {
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

  // Instant client-side validation as the user types (no debouncing needed!)
  useEffect(() => {
    const trimmed = email.trim()
    if (!trimmed) {
      setEmailStatus('idle')
      setEmailError(null)
      setMatchedUniversity(null)
      return
    }

    // Wait for domains to load before validating
    if (domainsLoading) {
      setEmailStatus('typing')
      return
    }

    const result = validateUniversityEmail(trimmed)
    if (result.valid && result.universityName) {
      setEmailStatus('valid')
      setEmailError(null)
      setMatchedUniversity(result.universityName)
    } else if (trimmed.includes('@')) {
      // Only show error if they've typed an @ (partial email)
      setEmailStatus('invalid')
      setEmailError(
        'Your email domain is not associated with a registered university.'
      )
      setMatchedUniversity(null)
    } else {
      setEmailStatus('typing')
      setEmailError(null)
      setMatchedUniversity(null)
    }
  }, [email, validDomains, domainsLoading])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailFromForm = (formData.get('email') as string) || '';
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validation
    const validation = validateSignupForm(emailFromForm, password, confirmPassword);
    if (!validation.isValid) {
      setError(validation.error || 'Validation failed');
      setLoading(false);
      return;
    }

    // Client-side university domain validation (final check before submit)
    const check = validateUniversityEmail(emailFromForm.trim());
    if (!check.valid) {
      setEmailError(
        'Your email domain is not associated with a registered university.'
      );
      setEmailStatus('invalid');
      setLoading(false);
      return;
    }

    // Call server action
    const result = await signUpNewUser(formData);

    if ('error' in result) {
      setError(result.error);
      setSuccess(false);
    } else if (result.success) {
      setSuccess(true);
      setMessage(result.message || 'Account created successfully!');
    }

    setLoading(false);
  }

  // Show success screen if signup was successful
  if (success) {
    return <SignUpSuccessScreen message={message} />;
  }

  return (
    <>
      <Reveal delay="delay-100">
        {/* Sign Up Card */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* University Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                University Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="you@stanford.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4717F6] focus:ring-1 focus:ring-[#4717F6] transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use your .edu email to verify your student status.
              </p>
              {domainsLoading && email && (
                <p className="mt-2 text-xs text-gray-400">Loading universities…</p>
              )}
              {emailError && (
                <p className="mt-2 text-xs text-red-300">{emailError}</p>
              )}
              {!emailError && emailStatus === 'valid' && matchedUniversity && (
                <p className="mt-2 text-xs text-green-300">
                  ✓ {matchedUniversity}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={8}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4717F6] focus:ring-1 focus:ring-[#4717F6] transition-colors"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                minLength={8}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4717F6] focus:ring-1 focus:ring-[#4717F6] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || domainsLoading || emailStatus === 'invalid'}
              className="w-full bg-[#4717F6] hover:bg-[#350ec9] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(71,23,246,0.5)] hover:shadow-[0_0_30px_rgba(71,23,246,0.7)] flex items-center justify-center gap-2 mt-6"
            >
              <UserPlus size={20} />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700" />
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-700" />
          </div>

          {/* Link to Login */}
          <p className="text-center text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#FFD700] font-semibold hover:underline transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </Reveal>

      {/* Footer Note */}
      <Reveal delay="delay-200">
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Reveal>
    </>
  );
}
