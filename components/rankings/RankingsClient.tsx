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

import { useMemo, useState } from 'react';
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
  // Search query state for filtering players/campuses
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch campus rankings (public, no auth required)
  const {
    campuses,
    error: campusError,
    isLoading: isCampusLoading,
    hasMore: hasMoreCampuses,
    loadMore: loadMoreCampuses,
  } = useCampusRankings();

  // Fetch player rankings (requires authentication)
  const {
    players,
    userEntry,
    error: playerError,
    isLoading: isPlayerLoading,
    hasMore: hasMorePlayers,
    loadMore: loadMorePlayers,
  } = usePlayerRankings(user, isAuthLoading);

  const autoMode: RankingsMode = !isAuthLoading && user ? 'players' : 'campuses';
  const effectiveMode = hasManualMode ? mode : autoMode;


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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasSearch = normalizedQuery.length > 0;

  const filteredPlayers = useMemo(() => {
    if (!hasSearch) {
      return displayPlayers;
    }

    return displayPlayers.filter((player) => {
      const haystack = `${player.name} ${player.tag}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [displayPlayers, hasSearch, normalizedQuery]);

  const filteredCampuses = useMemo(() => {
    if (!hasSearch) {
      return campuses;
    }

    return campuses.filter((campus) => {
      const haystack = `${campus.name} ${campus.short}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [campuses, hasSearch, normalizedQuery]);

  const isPlayerInitialLoading =
    isAuthLoading || (isPlayerLoading && players.length === 0);
  const isCampusInitialLoading = isCampusLoading && campuses.length === 0;
  const isPlayerLoadingMore = isPlayerLoading && players.length > 0;
  const isCampusLoadingMore = isCampusLoading && campuses.length > 0;

  return (
    <>
      {/* Mode switcher - allows manual toggle between players and campuses view */}
      <RankingsControls
        mode={effectiveMode}
        onModeChange={(nextMode) => {
          // Mark that user manually changed mode to prevent auto-switching
          setHasManualMode(true);
          setMode(nextMode);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {effectiveMode === 'players' ? (
          <>
            {/* Player rankings view - requires authentication */}
            {isPlayerInitialLoading ? (
              <LoadingPanel message="Loading player rankings..." />
            ) : !user ? (
              <AuthPrompt />
            ) : playerError && players.length === 0 ? (
              <ErrorPanel message={playerError} />
            ) : filteredPlayers.length === 0 ? (
              <EmptyPanel
                message={
                  hasSearch
                    ? 'No players match your search.'
                    : 'No player rankings yet. Check back soon.'
                }
              />
            ) : (
              <PlayersTable
                players={filteredPlayers}
                hasMore={hasMorePlayers}
                onShowMore={loadMorePlayers}
                isLoadingMore={isPlayerLoadingMore}
              />
            )}
          </>
        ) : (
          <>
            {/* Campus rankings view - public, no auth required */}
            {isCampusInitialLoading ? (
              <LoadingPanel message="Loading university rankings..." />
            ) : campusError && campuses.length === 0 ? (
              <ErrorPanel message={campusError} />
            ) : filteredCampuses.length === 0 ? (
              <EmptyPanel
                message={
                  hasSearch
                    ? 'No universities match your search.'
                    : 'No university rankings yet. Check back soon.'
                }
              />
            ) : (
              <CampusesTable
                campuses={filteredCampuses}
                hasMore={hasMoreCampuses}
                onShowMore={loadMoreCampuses}
                isLoadingMore={isCampusLoadingMore}
              />
            )}
          </>
        )}

        {/* Footer note explaining how rankings work */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            * Rankings update automatically based on season activity. Composite
            scores weight trophies, Path of Legends leagues, win rate, and
            three-crown rate.
          </p>
        </div>
      </div>

      {/* CTA - Only show when logged out and viewing campuses */}
      {!user && effectiveMode === 'campuses' && <RankingsCTA />}
    </>
  );
}
