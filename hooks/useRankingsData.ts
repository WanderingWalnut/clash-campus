import { useEffect, useState } from 'react';
import type { RankedCampus, RankedPlayer } from '@/types/rankings';

/**
 * Response type for the university rankings API endpoint.
 */
type CampusesResponse = {
  campuses: RankedCampus[];
  limit: number;
};

/**
 * Response type for the player rankings API endpoint.
 * Includes pagination metadata and the current user's entry (if not on current page).
 */
type PlayersResponse = {
  players: RankedPlayer[];
  user: RankedPlayer | null;
  page: number;
  pageSize: number;
  total: number;
};

/** Default number of universities to fetch for campus rankings */
const DEFAULT_CAMPUS_LIMIT = 25;

/** Default number of players to show per page in player rankings */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Generic fetch helper with abort signal support.
 * Used for all API requests to enable cancellation on unmount.
 *
 * @param url - API endpoint URL
 * @param signal - AbortSignal for request cancellation
 * @returns Parsed JSON response
 * @throws Error if request fails
 */
async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

/**
 * Hook for fetching and managing university/campus rankings.
 * This is a public endpoint, so it runs regardless of auth state.
 *
 * @returns Object containing campuses data, loading state, and error state
 */
export function useCampusRankings() {
  const [campuses, setCampuses] = useState<RankedCampus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCampuses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchJson<CampusesResponse>(
          `/api/rankings/universities?limit=${DEFAULT_CAMPUS_LIMIT}`,
          controller.signal
        );
        setCampuses(data.campuses ?? []);
      } catch (err) {
        // Ignore abort errors (component unmounted), but show other errors
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError('Unable to load university rankings right now.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampuses();

    // Abort in-flight fetches on unmount to avoid setting state after cleanup.
    return () => controller.abort();
  }, []);

  return { campuses, error, isLoading };
}

/**
 * Hook for fetching and managing player rankings.
 * Only fetches when user is authenticated.
 *
 * @param user - The authenticated user object (null if not authenticated)
 * @param isAuthLoading - Whether auth state is still loading
 * @returns Object containing players data, user entry, loading state, and error state
 */
export function usePlayerRankings(
  user: { id: string } | null,
  isAuthLoading: boolean
) {
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [userEntry, setUserEntry] = useState<RankedPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    // Wait for auth to finish loading before making decisions
    if (isAuthLoading) {
      return () => controller.abort();
    }

    // If no user, clear player data and don't fetch
    if (!user) {
      setPlayers([]);
      setUserEntry(null);
      setError(null);
      setIsLoading(false);
      return () => controller.abort();
    }

    const fetchPlayers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchJson<PlayersResponse>(
          `/api/rankings/players?page=1&pageSize=${DEFAULT_PAGE_SIZE}`,
          controller.signal
        );
        setPlayers(data.players ?? []);
        // User entry is provided separately if they're not on the current page
        setUserEntry(data.user ?? null);
      } catch (err) {
        // Ignore abort errors (component unmounted), but show other errors
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError('Unable to load player rankings right now.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();

    // Abort in-flight fetches on unmount to avoid state updates after cleanup.
    return () => controller.abort();
  }, [user, isAuthLoading]);

  return { players, userEntry, error, isLoading };
}

