'use client';

import { Shield } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

interface InitialVerificationFormProps {
  playerTag: string;
  setPlayerTag: (tag: string) => void;
  loading: boolean;
  error: string | null;
  onVerify: () => void;
}

/**
 * Initial verification form UI.
 * Displays the player tag input and verification steps.
 */
export function InitialVerificationForm({
  playerTag,
  setPlayerTag,
  loading,
  error,
  onVerify,
}: InitialVerificationFormProps) {
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
              <div className="w-full">
                <p className="text-white font-medium mb-2">Enter Your Player Tag</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="playerTag"
                    name="playerTag"
                    value={playerTag}
                    onChange={(e) => setPlayerTag(e.target.value)}
                    placeholder="Enter Your Player Tag"
                    className="flex-1 max-w-xs px-4 py-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4717F6] focus:ring-1 focus:ring-[#4717F6] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={onVerify}
                    disabled={loading}
                    className="px-6 py-3 bg-[#4717F6] hover:bg-[#5a1fff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-300"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-1">
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm mb-4">
              {error}
            </div>
          )}
        </div>
      </Reveal>

      {/* Footer Note */}
      <Reveal delay="delay-200">
        <p className="mt-6 text-center text-xs text-gray-500">
          Your Clash Royale stats are synced securely via the Clash Royale API.
        </p>
      </Reveal>
    </>
  );
}

