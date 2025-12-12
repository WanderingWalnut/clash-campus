'use client';

import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Sign up form component.
 * Displays form fields for university email, password, and confirm password.
 * No backend logic implemented yet.
 */
export function SignUpForm() {
  return (
    <>
      <Reveal delay="delay-100">
        {/* Sign Up Card */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5">
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
                placeholder="you@stanford.edu"
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4717F6] focus:ring-1 focus:ring-[#4717F6] transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use your .edu email to verify your student status.
              </p>
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
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4717F6] focus:ring-1 focus:ring-[#4717F6] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#4717F6] hover:bg-[#350ec9] text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(71,23,246,0.5)] hover:shadow-[0_0_30px_rgba(71,23,246,0.7)] flex items-center justify-center gap-2 mt-6"
            >
              <UserPlus size={20} />
              Create Account
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
