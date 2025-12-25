'use client';

/**
 * RankingsClient Component
 *
 * Main client component for the Royale Rankings page. Handles:
 * - Displaying university/campus rankings (public)
 * - Displaying player rankings (authenticated users only)
 * - Automatic mode switching based on auth state
 * - Manual mode switching via user controls
 * - Orchestrating data fetching via custom hooks
 * - Ensuring the current user's rank is always visible in player rankings
 */

import { useEffect, useMemo, useState } from 'react';
import { RankingsControls } from './RankingsControls';
import { PlayersTable } from './PlayersTable';
import { CampusesTable } from './CampusesTable';
import { RankingsCTA } from './RankingsCTA';
import {
  LoadingPanel,
  ErrorPanel,
  EmptyPanel,
  AuthPrompt,
} from './RankingsPanels';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCampusRankings, usePlayerRankings } from '@/hooks/useRankingsData';
import type { RankingsMode } from '@/types/rankings';

export function RankingsClient() {
  // Authentication state - determines if player rankings are accessible
  const { user, isLoading: isAuthLoading } = useAuth();

  // View mode state - controls which rankings table is displayed
  const [mode, setMode] = useState<RankingsMode>('campuses');
  // Tracks if user has manually changed the mode (prevents auto-switching)
  const [hasManualMode, setHasManualMode] = useState(false);

  // Fetch campus rankings (public, no auth required)
  const {
    campuses,
    error: campusError,
    isLoading: isCampusLoading,
  } = useCampusRankings();

  // Fetch player rankings (requires authentication)
  const {
    players,
    userEntry,
    error: playerError,
    isLoading: isPlayerLoading,
  } = usePlayerRankings(user, isAuthLoading);

  /**
   * Auto-switch mode based on authentication state.
   * - If user is logged in, default to 'players' view
   * - If user is not logged in, default to 'campuses' view
   * - Only auto-switches if user hasn't manually changed the mode
   */
  useEffect(() => {
    // Don't auto-switch while auth is loading or if user manually changed mode
    if (isAuthLoading || hasManualMode) {
      return;
    }

    // Auto-switch: authenticated users see players, unauthenticated see campuses
    setMode(user ? 'players' : 'campuses');
  }, [user, isAuthLoading, hasManualMode]);


  /**
   * Computed list of players to display in the table.
   * Ensures the current user's entry is always visible, even if they're not
   * on the current page. If the user is already in the players list, we don't
   * duplicate their entry.
   */
  const displayPlayers = useMemo(() => {
    // If no separate user entry, just show the players from current page
    if (!userEntry) {
      return players;
    }

    // Check if user is already in the current page's players
    const hasUser = players.some((player) => player.isUser);
    if (hasUser) {
      // User is already visible, no need to append
      return players;
    }

    // User is not on current page, append their entry so they can see their rank
    return [...players, userEntry];
  }, [players, userEntry]);

  return (
    <>
      {/* Mode switcher - allows manual toggle between players and campuses view */}
      <RankingsControls
        mode={mode}
        onModeChange={(nextMode) => {
          // Mark that user manually changed mode to prevent auto-switching
          setHasManualMode(true);
          setMode(nextMode);
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'players' ? (
          <>
            {/* Player rankings view - requires authentication */}
            {isAuthLoading || isPlayerLoading ? (
              <LoadingPanel message="Loading player rankings..." />
            ) : !user ? (
              <AuthPrompt />
            ) : playerError ? (
              <ErrorPanel message={playerError} />
            ) : displayPlayers.length === 0 ? (
              <EmptyPanel message="No player rankings yet. Check back soon." />
            ) : (
              <PlayersTable players={displayPlayers} />
            )}
          </>
        ) : (
          <>
            {/* Campus rankings view - public, no auth required */}
            {isCampusLoading ? (
              <LoadingPanel message="Loading university rankings..." />
            ) : campusError ? (
              <ErrorPanel message={campusError} />
            ) : campuses.length === 0 ? (
              <EmptyPanel message="No university rankings yet. Check back soon." />
            ) : (
              <CampusesTable campuses={campuses} />
            )}
          </>
        )}

        {/* Footer note explaining how rankings work */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            * Rankings update automatically based on season activity. Composite
            scores favor recent win streaks and high ladder placement.
          </p>
        </div>
      </div>

      {/* CTA - Only show when logged out and viewing campuses */}
      {!user && mode === 'campuses' && <RankingsCTA />}
    </>
  );
}

