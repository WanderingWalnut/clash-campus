'use client';

import { Clock, CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { formatTimeRemaining } from './utils/formatTimeRemaining';
import type { VerificationSession } from './hooks/useVerification';

interface DeckVerificationViewProps {
  session: VerificationSession;
  playerName: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  onVerifyDeck: () => void;
}

/**
 * Deck verification view UI.
 * Displays the required deck and verification instructions.
 */
export function DeckVerificationView({
  session,
  playerName,
  loading,
  error,
  success,
  onVerifyDeck,
}: DeckVerificationViewProps) {
  return (
    <>
      <Reveal delay="delay-100">
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white text-center mb-2">
            Set Your Verification Deck
          </h2>
          <p className="text-gray-400 text-center text-sm mb-2">
            Welcome, <span className="text-[#FFD700] font-medium">{playerName}</span>!
          </p>
          <p className="text-gray-400 text-center text-sm mb-6">
            Set the deck shown below in Clash Royale to verify ownership.
          </p>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-sm">
              Expires in {formatTimeRemaining(session.expiresAt)}
            </span>
          </div>

          {/* Required Deck Grid */}
          <div className="bg-[#0D0D0D] rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-3 text-center">
              Required Deck
            </p>
            <div className="grid grid-cols-4 gap-2">
              {session.requiredDeck.map((card, index) => {
                // Prefer evolution/hero variants, fall back to standard medium icon
                const imageUrl = card.iconUrls?.evolutionMedium
                  || card.iconUrls?.heroMedium
                  || card.iconUrls?.medium;

                return (
                  <div
                    key={`${card.id}-${index}`}
                    className="bg-[#1a1a1a] rounded-lg p-2 flex flex-col items-center"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={card.name}
                        className="w-12 h-12 object-contain mb-1"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded mb-1 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">?</span>
                      </div>
                    )}
                    <span className="text-gray-300 text-xs text-center truncate w-full">
                      {card.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#4717F6]/10 border border-[#4717F6]/30 rounded-lg p-4 mb-6">
            <p className="text-[#4717F6] text-sm font-medium mb-2">How to verify:</p>
            <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
              <li>Open Clash Royale</li>
              <li>Create a new deck with these exact 8 cards</li>
              <li>Save the deck and return here</li>
              <li>Click &quot;Verify My Deck&quot; below</li>
            </ol>
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={onVerifyDeck}
            disabled={loading || success}
            className="w-full py-3 bg-[#4717F6] hover:bg-[#5a1fff] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-300"
          >
            {loading ? 'Verifying...' : success ? 'Verified!' : 'Verify My Deck'}
          </button>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm mt-4">
              {error}
            </div>
          )}

          {/* Session Info */}
          {session.playerTag && (
            <p className="mt-4 text-center text-xs text-gray-600">
              Player Tag: {session.playerTag}
            </p>
          )}
        </div>
      </Reveal>

      <Reveal delay="delay-200">
        <p className="mt-6 text-center text-xs text-gray-500">
          Session ID: {session.sessionId.slice(0, 8)}...
        </p>
      </Reveal>
    </>
  );
}
