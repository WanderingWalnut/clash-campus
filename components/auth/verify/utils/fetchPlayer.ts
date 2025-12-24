import type { ClashRoyalePlayer } from '@/types/clash-royale';

/**
 * Fetches a player's profile from the Clash Royale API.
 *
 * @param playerTag - The player tag (with or without '#')
 * @returns The player data or throws an error
 */
export async function fetchPlayer(playerTag: string): Promise<ClashRoyalePlayer> {
  const encodedTag = encodeURIComponent(playerTag);
  const response = await fetch(`/api/clash-royale-api/user?playerTag=${encodedTag}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch player data' }));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }

  return response.json();
}

