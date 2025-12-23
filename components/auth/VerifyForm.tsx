'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { initiateVerification } from '@/app/verify/action';
import type { ClashRoyaleCard, ClashRoyalePlayer } from '@/types/clash-royale';
import type { PendingVerificationSession } from '@/types/auth';

/**
 * Fetches a player's profile from the Clash Royale API.
 * 
 * @param playerTag - The player tag (with or without '#')
 * @returns The player data or throws an error
 */
async function fetchPlayer(playerTag: string): Promise<ClashRoyalePlayer> {
  const encodedTag = encodeURIComponent(playerTag);
  const response = await fetch(`/api/clash-royale-api/user?playerTag=${encodedTag}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch player data' }));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Verification session state after initiation
 */
interface VerificationSession {
  sessionId: string;
  playerTag?: string;
  requiredDeck: ClashRoyaleCard[];
  expiresAt: Date;
}

interface VerifyFormProps {
  /** Pre-existing pending session from server */
  initialSession?: PendingVerificationSession | null;
}

/**
 * Verification form component.
 * Allows users to link their Clash Royale account by entering their player tag.
 * 
 * Note: Auth state and logout redirects are handled by AuthProvider at the root level.
 * This component focuses purely on the verification UI and logic.
 */
export function VerifyForm({ initialSession }: VerifyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerTag, setPlayerTag] = useState('');
  const [playerName, setPlayerName] = useState<string | null>(
    initialSession?.playerName ?? null
  );
  const [session, setSession] = useState<VerificationSession | null>(
    initialSession
      ? {
          sessionId: initialSession.sessionId,
          playerTag: initialSession.playerTag,
          requiredDeck: initialSession.requiredDeck,
          expiresAt: new Date(initialSession.expiresAt),
        }
      : null
  );

  // Sync initialSession prop with component state when it's provided
  // This handles the case where user refreshes page after initiating verification
  useEffect(() => {
    if (initialSession && !session) {
      setSession({
        sessionId: initialSession.sessionId,
        playerTag: initialSession.playerTag,
        requiredDeck: initialSession.requiredDeck,
        expiresAt: new Date(initialSession.expiresAt),
      });
      setPlayerName(initialSession.playerName);
    }
  }, [initialSession, session]);

  async function handleVerify() {
    const trimmedTag = playerTag.trim();
    if (!trimmedTag) {
      setError('Please enter a player tag');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Step 1: Fetch player data from Clash Royale API
      const player = await fetchPlayer(trimmedTag);
      setPlayerName(player.name);

      // Step 2: Initiate verification (creates account + session)
      const result = await initiateVerification(trimmedTag, player);

      if ('error' in result) {
        setError(result.error);
        return;
      }

      // Step 3: Store session info and display required deck
      setSession({
        sessionId: result.sessionId,
        requiredDeck: result.requiredDeck,
        expiresAt: new Date(result.expiresAt),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify player tag. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Format remaining time for expiration
  function formatTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  // If session exists, show the deck verification UI
  if (session) {
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

            {/* Verify Button (placeholder for future implementation) */}
            <button
              type="button"
              disabled
              className="w-full py-3 bg-gray-700 text-gray-400 font-medium rounded-lg cursor-not-allowed"
            >
              Verify My Deck (Coming Soon)
            </button>

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

  // Default: Show the initial verification form
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
                    onClick={handleVerify}
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
          Your Clash Royale stats are synced securely via the Supercell API.
        </p>
      </Reveal>
    </>
  );
}
