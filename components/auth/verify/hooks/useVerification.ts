import { useState, useEffect } from 'react';
import { initiateVerification } from '@/app/verify/action';
import { fetchPlayer } from '../utils/fetchPlayer';
import type { ClashRoyaleCard } from '@/types/clash-royale';
import type { PendingVerificationSession } from '@/types/auth';

/**
 * Verification session state after initiation
 */
export interface VerificationSession {
  sessionId: string;
  playerTag?: string;
  requiredDeck: ClashRoyaleCard[];
  expiresAt: Date;
}

/**
 * Return type for the useVerification hook
 */
export interface UseVerificationReturn {
  session: VerificationSession | null;
  loading: boolean;
  error: string | null;
  playerTag: string;
  setPlayerTag: (tag: string) => void;
  playerName: string | null;
  handleVerify: () => Promise<void>;
}

/**
 * Custom hook for managing Clash Royale account verification flow.
 *
 * Handles:
 * - Player tag input state
 * - API fetching for player data
 * - Verification session creation
 * - Error handling
 *
 * @param initialSession - Pre-existing pending session from server (if any)
 * @returns Object containing state and handlers for verification flow
 */
export function useVerification(
  initialSession?: PendingVerificationSession | null
): UseVerificationReturn {
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

  return {
    session,
    loading,
    error,
    playerTag,
    setPlayerTag,
    playerName,
    handleVerify,
  };
}

