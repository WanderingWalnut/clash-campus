'use client';

import { useState } from 'react';
import { Shield, Gamepad2, CheckCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { bypassVerification } from '@/app/verify/action';

/**
 * Verification form component.
 * Displays verification instructions and a temporary bypass button for development.
 */
export function VerifyForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBypass() {
    setError(null);
    setLoading(true);

    const result = await bypassVerification();

    if ('error' in result) {
      setError(result.error);
      setLoading(false);
    }
    // On success, the server action redirects
  }

  return (
    <>
      <Reveal delay="delay-100">
        {/* Main Verification Card */}
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#4717F6]/20 flex items-center justify-center">
              <Shield className="w-10 h-10 text-[#4717F6]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white text-center mb-2">
            Link Your Clash Royale Account
          </h2>
          <p className="text-gray-400 text-center text-sm mb-6">
            Verify ownership of your player tag to join the rankings.
          </p>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#FFD700] font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Enter Your Player Tag</p>
                <p className="text-gray-500 text-sm">
                  Find it in-game under Settings → Player Tag
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#FFD700] font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Set Verification Deck</p>
                <p className="text-gray-500 text-sm">
                  We&apos;ll ask you to set a specific deck to prove ownership
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#FFD700] font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Get Verified</p>
                <p className="text-gray-500 text-sm">
                  Once confirmed, you&apos;ll appear on your campus leaderboard
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700" />
            <span className="px-4 text-sm text-gray-500">Coming Soon</span>
            <div className="flex-1 border-t border-gray-700" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          {/* Bypass Button (Development Only) */}
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">
                Development Mode
              </span>
            </div>
            <p className="text-yellow-200/70 text-sm mb-3">
              Skip verification during development. This will be removed in production.
            </p>
            <button
              type="button"
              onClick={handleBypass}
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              {loading ? 'Bypassing...' : 'Bypass Verification'}
            </button>
          </div>
        </div>
      </Reveal>

      {/* Footer Note */}
      <Reveal delay="delay-200">
        <p className="mt-6 text-center text-xs text-gray-500">
          Your Clash Royale stats are synced securely via the Supercell API.
        </p>
      </Reveal>
    </>
  );
}

