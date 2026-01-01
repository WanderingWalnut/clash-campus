import { useState, useEffect } from 'react';
import { initiateVerification, refreshVerificationSession, verifyDeck } from '@/app/verify/actions';
import { fetchPlayer } from '../utils/fetchPlayer';
import type { ClashRoyaleCard } from '@/types/clash-royale';
import type { PendingVerificationSession } from '@/types/auth';
import { useRouter } from 'next/navigation';

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
  verifyLoading: boolean;
  refreshLoading: boolean;
  error: string | null;
  verifyError: string | null;
  verifySuccess: boolean;
  playerTag: string;
  setPlayerTag: (tag: string) => void;
  playerName: string | null;
  isExpired: boolean;
  handleVerify: () => Promise<void>;
  handleVerifyDeck: () => Promise<void>;
  handleRefreshSession: () => Promise<void>;
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
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [playerTag, setPlayerTag] = useState('');
  const [playerName, setPlayerName] = useState<string | null>(
    initialSession?.playerName ?? null
  );
  const router = useRouter();
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
        playerTag: player.tag,
        requiredDeck: result.requiredDeck,
        expiresAt: new Date(result.expiresAt),
      });
      setVerifyError(null);
      setVerifySuccess(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify player tag. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyDeck() {
    if (!session?.sessionId) {
      setVerifyError('No active verification session found.');
      return;
    }

    setVerifyError(null);
    setVerifyLoading(true);

    try {
      const result = await verifyDeck(session.sessionId);

      if ('error' in result) {
        setVerifyError(result.error);
        return;
      }

      setVerifySuccess(true);
      try {
        sessionStorage.setItem('rankings.forceRefresh', '1');
      } catch {
        // Ignore storage failures (private mode, blocked access, etc.)
      }
      router.push('/rankings');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify deck. Please try again.';
      setVerifyError(message);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleRefreshSession() {
    const setErrorState = session ? setVerifyError : setError;
    setErrorState(null);
    setVerifySuccess(false);
    setRefreshLoading(true);

    try {
      const result = await refreshVerificationSession();

      if ('error' in result) {
        setErrorState(result.error);
        return;
      }

      setSession({
        sessionId: result.sessionId,
        playerTag: result.playerTag,
        requiredDeck: result.requiredDeck,
        expiresAt: new Date(result.expiresAt),
      });
      setPlayerName(result.playerName);
      setVerifyError(null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Failed to refresh verification session. Please try again.';
      setErrorState(message);
    } finally {
      setRefreshLoading(false);
    }
  }

  const isExpired = session ? new Date(session.expiresAt) < new Date() : false;

  return {
    session,
    loading,
    verifyLoading,
    refreshLoading,
    error,
    verifyError,
    verifySuccess,
    playerTag,
    setPlayerTag,
    playerName,
    isExpired,
    handleVerify,
    handleVerifyDeck,
    handleRefreshSession,
  };
}
