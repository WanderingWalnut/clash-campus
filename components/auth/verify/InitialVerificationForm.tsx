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
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-5 sm:p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-3 sm:mb-6 -mt-2 sm:-mt-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#4717F6]/20 flex items-center justify-center aspect-square">
              <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-[#4717F6]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-white text-center mb-2">
            Link Your Clash Royale Account
          </h2>
          <p className="text-gray-400 text-center text-sm mb-5 sm:mb-6">
            Verify ownership of your player tag to join the rankings.
          </p>

          {/* Steps */}
          <div className="space-y-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 mt-0.5 aspect-square">
                <span className="text-[#FFD700] font-bold text-xs sm:text-sm">1</span>
              </div>
              <div className="w-full">
                <p className="text-white font-medium mb-4 sm:mb-3.5 text-sm sm:text-base">Enter Your Player Tag</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-2">
                  <input
                    type="text"
                    id="playerTag"
                    name="playerTag"
                    value={playerTag}
                    onChange={(e) => setPlayerTag(e.target.value)}
                    placeholder="Enter Your Player Tag"
                    className="flex-1 w-full sm:max-w-xs px-4 py-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4717F6] focus:ring-1 focus:ring-[#4717F6] transition-colors text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={onVerify}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 bg-[#4717F6] hover:bg-[#5a1fff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-300 text-sm sm:text-base"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-3 sm:mt-2.5">
                  Find it in-game under Settings → Player Tag
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 mt-0.5 aspect-square">
                <span className="text-[#FFD700] font-bold text-xs sm:text-sm">2</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm sm:text-base mb-0.5">Set Verification Deck</p>
                <p className="text-gray-500 text-sm">
                  We&apos;ll ask you to set a specific deck to prove ownership
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFD700]/20 flex items-center justify-center flex-shrink-0 mt-0.5 aspect-square">
                <span className="text-[#FFD700] font-bold text-xs sm:text-sm">3</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm sm:text-base mb-0.5">Get Verified</p>
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
        <p className="mt-4 sm:mt-6 text-center text-xs text-gray-500">
          Your Clash Royale stats are synced securely via the Clash Royale API.
        </p>
      </Reveal>
    </>
  );
}

