'use client';

import { useVerification } from './hooks/useVerification';
import { InitialVerificationForm } from './InitialVerificationForm';
import { DeckVerificationView } from './DeckVerificationView';
import type { PendingVerificationSession } from '@/types/auth';

interface VerifyFormProps {
  /** Pre-existing pending session from server */
  initialSession?: PendingVerificationSession | null;
  hasAccount?: boolean;
}

/**
 * Verification form component.
 * Allows users to link their Clash Royale account by entering their player tag.
 *
 * Note: Auth state and logout redirects are handled by AuthProvider at the root level.
 * This component focuses purely on the verification UI and logic.
 */
export function VerifyForm({ initialSession, hasAccount }: VerifyFormProps) {
  const {
    session,
    loading,
    error,
    verifyLoading,
    refreshLoading,
    verifyError,
    verifySuccess,
    playerTag,
    setPlayerTag,
    playerName,
    isExpired,
    handleVerify,
    handleVerifyDeck,
    handleRefreshSession,
  } = useVerification(initialSession);

  // If session exists, show the deck verification UI
  if (session) {
    return (
      <DeckVerificationView
        session={session}
        playerName={playerName}
        loading={verifyLoading}
        refreshLoading={refreshLoading}
        error={verifyError}
        success={verifySuccess}
        onVerifyDeck={handleVerifyDeck}
        onRefreshSession={handleRefreshSession}
        isExpired={isExpired}
      />
    );
  }

  // Default: Show the initial verification form
  return (
    <InitialVerificationForm
      playerTag={playerTag}
      setPlayerTag={setPlayerTag}
      loading={loading}
      error={error}
      onVerify={handleVerify}
      hasAccount={hasAccount}
      refreshLoading={refreshLoading}
      onRefreshSession={handleRefreshSession}
    />
  );
}
