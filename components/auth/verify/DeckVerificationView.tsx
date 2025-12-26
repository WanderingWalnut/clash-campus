'use client';

import Image from 'next/image';
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
        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-3 md:p-8 shadow-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-2 md:mb-6">
            <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 md:w-10 md:h-10 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg md:text-xl font-bold text-white text-center mb-0.5 md:mb-2">
            Set Your Verification Deck
          </h2>
          <p className="text-gray-400 text-center text-xs md:text-sm mb-0.5 md:mb-2">
            Welcome, <span className="text-[#FFD700] font-medium">{playerName}</span>!
          </p>


          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-6">
            <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
            <span className="text-gray-500 text-xs md:text-sm">
              Expires in {formatTimeRemaining(session.expiresAt)}
            </span>
          </div>

          {/* Required Deck Grid */}
          <div className="bg-[#0D0D0D] rounded-xl p-2 md:p-4 mb-3 md:mb-6">
            <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wide mb-1.5 md:mb-3 text-center">
              Required Deck
            </p>
            <div className="grid grid-cols-4 gap-1.5 md:gap-2">
              {session.requiredDeck.map((card, index) => {
                // Prefer regular medium icon, fall back to evolution/hero variants
                const imageUrl = card.iconUrls?.medium
                  || card.iconUrls?.evolutionMedium
                  || card.iconUrls?.heroMedium;

                return (
                  <div
                    key={`${card.id}-${index}`}
                    className="bg-[#1a1a1a] rounded-lg p-1 md:p-2 flex flex-col items-center"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={card.name}
                        width={48}
                        height={48}
                        className="w-10 h-10 md:w-12 md:h-12 object-contain mb-0.5 md:mb-1"
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-700 rounded mb-0.5 md:mb-1 flex items-center justify-center">
                        <span className="text-gray-500 text-[10px] md:text-xs">?</span>
                      </div>
                    )}
                    <span className="text-gray-300 text-[10px] md:text-xs text-center leading-tight">
                      {(() => {
                        const words = card.name.split(' ');
                        return words.length > 1 ? (
                          <>
                            {words[0]}
                            <br />
                            {words.slice(1).join(' ')}
                          </>
                        ) : (
                          card.name
                        );
                      })()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#4717F6]/10 border border-[#4717F6]/30 rounded-lg p-2 md:p-4 mb-3 md:mb-6">
            <p className="text-[#4717F6] text-xs md:text-sm font-medium mb-1 md:mb-2">How to verify:</p>
            <ol className="text-gray-400 text-xs md:text-sm space-y-0.5 md:space-y-1 list-decimal list-inside">
              <li>Open Clash Royale and create a new deck with these exact 8 cards</li>
              <li>Save the deck and play a game (friendly battle recommended to avoid trophy loss)</li>
              <li>Wait 2 minutes after the game completes</li>
              <li>Click &quot;Verify My Deck&quot; below</li>
            </ol>
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={onVerifyDeck}
            disabled={loading || success}
            className="w-full py-2 md:py-3 bg-[#4717F6] hover:bg-[#5a1fff] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm md:text-base font-medium rounded-lg transition-colors duration-300"
          >
            {loading ? 'Verifying...' : success ? 'Verified!' : 'Verify My Deck'}
          </button>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-2 md:p-3 text-red-300 text-xs md:text-sm mt-2 md:mt-4">
              {error}
            </div>
          )}

          {/* Session Info */}
          {session.playerTag && (
            <p className="mt-2 md:mt-4 text-center text-[10px] md:text-xs text-gray-600">
              Player Tag: {session.playerTag}
            </p>
          )}
        </div>
      </Reveal>

      <Reveal delay="delay-200">
        <p className="mt-2 md:mt-6 text-center text-[10px] md:text-xs text-gray-500">
          Session ID: {session.sessionId.slice(0, 8)}...
        </p>
      </Reveal>
    </>
  );
}
