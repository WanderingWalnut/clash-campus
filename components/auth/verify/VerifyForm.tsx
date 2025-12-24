'use client';

import { useVerification } from './hooks/useVerification';
import { InitialVerificationForm } from './InitialVerificationForm';
import { DeckVerificationView } from './DeckVerificationView';
import type { PendingVerificationSession } from '@/types/auth';

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
  const {
    session,
    loading,
    error,
    verifyLoading,
    verifyError,
    verifySuccess,
    playerTag,
    setPlayerTag,
    playerName,
    handleVerify,
    handleVerifyDeck,
  } = useVerification(initialSession);

  // If session exists, show the deck verification UI
  if (session) {
    return (
      <DeckVerificationView
        session={session}
        playerName={playerName}
        loading={verifyLoading}
        error={verifyError}
        success={verifySuccess}
        onVerifyDeck={handleVerifyDeck}
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
    />
  );
}
