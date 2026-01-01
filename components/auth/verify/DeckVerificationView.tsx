'use client';

import Image from 'next/image';
import { Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { formatTimeRemaining } from './utils/formatTimeRemaining';
import { generateDeckLink } from './utils/generateDeckLink';
import type { VerificationSession } from './hooks/useVerification';

interface DeckVerificationViewProps {
  session: VerificationSession;
  playerName: string | null;
  loading: boolean;
  refreshLoading: boolean;
  error: string | null;
  success: boolean;
  onVerifyDeck: () => void;
  onRefreshSession: () => void;
  isExpired: boolean;
}

/**
 * Deck verification view UI.
 * Displays the required deck and verification instructions.
 */
export function DeckVerificationView({
  session,
  playerName,
  loading,
  refreshLoading,
  error,
  success,
  onVerifyDeck,
  onRefreshSession,
  isExpired,
}: DeckVerificationViewProps) {
  const timeRemaining = formatTimeRemaining(session.expiresAt);
  const sessionExpired = isExpired || timeRemaining === 'Expired';

  return (
    <>
      <Reveal delay="delay-100">
        <div className="bg-[#1A2332] border border-gray-800 rounded-2xl p-3 md:p-8 shadow-2xl relative">
          {success && (
            <Image
              src="/assets/stickers/Clash Royale Sticker Sticker by Clash Stars ES (4).gif"
              alt=""
              width={140}
              height={140}
              className="pointer-events-none absolute -right-6 -top-6 w-20 md:w-28 opacity-90 hidden sm:block"
              aria-hidden="true"
            />
          )}
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
              {sessionExpired ? 'Expired' : `Expires in ${timeRemaining}`}
            </span>
          </div>

          {/* Required Deck Grid */}
          <div className="bg-[#0F1B2E] rounded-xl p-2 md:p-4 mb-3 md:mb-6">
            <div className="flex items-center justify-between mb-1.5 md:mb-3">
              <p className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wide">
                Required Deck
              </p>
              <button
                type="button"
                onClick={() => {
                  const deckLink = generateDeckLink(session.requiredDeck);
                  if (deckLink) {
                    window.open(deckLink, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="flex items-center gap-1 text-[#003DA5] hover:text-[#2D85F3] text-[10px] md:text-xs font-medium transition-colors"
                title="Open deck in Clash Royale"
              >
                <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="hidden sm:inline">Copy Deck</span>
                <span className="sm:hidden">Copy</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 md:gap-2">
              {session.requiredDeck.map((card, index) => {
                // Prefer regular medium icon, fall back to evolution/hero variants
                const imageUrl = card.iconUrls?.medium
                  || card.iconUrls?.evolutionMedium
                  || card.iconUrls?.heroMedium;

                return (
                  <div
                    key={`${card.id}-${index}`}
                    className="bg-[#1B2637] rounded-lg p-1 md:p-2 flex flex-col items-center"
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
          <div className="bg-[#003DA5]/10 border border-[#003DA5]/30 rounded-lg p-2 md:p-4 mb-3 md:mb-6">
            <p className="text-[#003DA5] text-xs md:text-sm font-medium mb-1 md:mb-2">How to verify:</p>
            <ol className="text-gray-400 text-xs md:text-sm space-y-0.5 md:space-y-1 list-decimal list-inside">
              <li>Open Clash Royale and create a new deck with these exact 8 cards</li>
              <li>Save the deck and play a game (friendly battle recommended to avoid trophy loss)</li>
              <li>Wait 2 minutes after the game completes</li>
              <li>Click &quot;Verify My Deck&quot; below</li>
            </ol>
          </div>

          {/* Verify Button */}
          {sessionExpired ? (
            <button
              type="button"
              onClick={onRefreshSession}
              disabled={refreshLoading}
              className="button-royale w-full py-2 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm md:text-base font-medium rounded-lg transition-transform duration-300 hover:-translate-y-0.5"
            >
              {refreshLoading ? 'Starting...' : 'Start New Verification'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onVerifyDeck}
              disabled={loading || success}
              className="button-royale w-full py-2 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm md:text-base font-medium rounded-lg transition-transform duration-300 hover:-translate-y-0.5"
            >
              {loading ? 'Verifying...' : success ? 'Verified!' : 'Verify My Deck'}
            </button>
          )}

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
