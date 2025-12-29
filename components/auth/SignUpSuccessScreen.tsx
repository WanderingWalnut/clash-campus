'use client';

import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';

interface SignUpSuccessScreenProps {
  message?: string | null;
}

/**
 * Success screen shown after successful signup.
 * Displays confirmation message and link back to login.
 */
export function SignUpSuccessScreen({ message }: SignUpSuccessScreenProps) {
  return (
    <Reveal delay="delay-100">
      <div className="bg-[#1A2332] border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Check Your Email!</h2>
        <p className="text-gray-300 mb-2">
          {message || 'We\'ve sent a confirmation email to verify your student email address.'}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Click the link in the email to activate your account.
        </p>
        <Link
          href="/login"
          className="text-[#FFD700] font-semibold hover:underline transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </Reveal>
  );
}

