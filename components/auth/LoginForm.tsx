'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { logInUser } from '@/app/(auth)/login/action';
import { useState } from 'react';

/**
 * Login form component.
 * Handles user authentication with email and password.
 */
export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Call server action
    const result = await logInUser(formData);

    if ('error' in result) {
      setError(result.error);
    }
    // Note: On success, the server action redirects, so we don't need to handle success here

    setLoading(false);
  }

  return (
    <>
      <Reveal delay="delay-100">
        {/* Login Card */}
        <div className="bg-[#1A2332] border border-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
          <form className="space-y-3 sm:space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-2.5 sm:p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="you@university.edu"
                className="w-full px-4 py-2.5 sm:py-3 bg-[#0F1B2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#003DA5] focus:ring-1 focus:ring-[#003DA5] transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 sm:py-3 bg-[#0F1B2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#003DA5] focus:ring-1 focus:ring-[#003DA5] transition-colors"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="#"
                className="text-sm text-gray-400 hover:text-[#FFD700] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="button-royale w-full disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-transform duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4 sm:my-6">
            <div className="flex-1 border-t border-gray-700" />
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-700" />
          </div>

          {/* Link to Sign Up */}
          <p className="text-center text-gray-400 text-sm sm:text-base">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-[#FFD700] font-semibold hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Reveal>

      {/* Footer Note */}
      <Reveal delay="delay-200">
        <p className="mt-4 sm:mt-6 text-center text-xs text-gray-500">
          Secure login powered by Supercell ID verification.
        </p>
      </Reveal>
    </>
  );
}
