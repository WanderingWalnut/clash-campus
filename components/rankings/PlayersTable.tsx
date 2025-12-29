'use client';

import Image from 'next/image';
import { Trophy } from 'lucide-react';
import { RankChange } from './RankChange';
import type { RankedPlayer } from '@/types/rankings';

const DEFAULT_AVATAR_SRC = '/assets/images/default_profile/image.png';
const BLUE_CROWN_SRC = '/assets/images/Blue_Crown/image.png';
const RED_CROWN_SRC = '/assets/images/Red_crown/image.png';
const XP_ICON_SRC = '/assets/images/XP/image.png';

interface PlayersTableProps {
  /** Array of player data to display */
  players: RankedPlayer[];
  /** Whether more players can be loaded */
  hasMore: boolean;
  /** Callback to load more players */
  onShowMore: () => void;
  /** Whether an additional page is loading */
  isLoadingMore?: boolean;
}

/**
 * Displays the players leaderboard table with rankings, scores, and stats.
 *
 * @param players - Array of RankedPlayer objects to display
 */
export function PlayersTable({
  players,
  hasMore,
  onShowMore,
  isLoadingMore = false,
}: PlayersTableProps) {
  return (
    <div className="bg-[#1B2637] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
        <div className="col-span-7 md:col-span-4">Player</div>
        <div className="col-span-3 md:col-span-3 text-right md:text-left">
          POWER LEVEL
        </div>
        <div className="hidden md:block col-span-1 text-right">POL</div>
        <div className="hidden md:block col-span-2 text-right">Trophies</div>
        <div className="hidden md:block col-span-1 text-right">Wins</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-800">
        {players.map((player) => (
          <PlayerRow key={`${player.rank}-${player.tag}`} player={player} />
        ))}
      </div>

      {hasMore && (
        <div className="p-4 border-t border-gray-800 bg-gray-900/30 text-center">
          <button
            type="button"
            onClick={onShowMore}
            disabled={isLoadingMore}
            className="text-xs text-gray-400 hover:text-white uppercase tracking-widest font-bold disabled:text-gray-600 disabled:hover:text-gray-600"
          >
            {isLoadingMore ? 'Loading...' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  );
}

interface PlayerRowProps {
  player: RankedPlayer;
}

/**
 * Individual row in the players table.
 *
 * @param player - The player data to display (RankedPlayer)
 */
function PlayerRow({ player }: PlayerRowProps) {
  const isTopThree = player.rank <= 3;
  const crownSrc = player.rank === 1 ? BLUE_CROWN_SRC : RED_CROWN_SRC;
  const crownGlowClass =
    player.rank === 1
      ? 'drop-shadow-[0_0_8px_rgba(0,61,165,0.45)]'
      : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.45)]';

  return (
    <div
      className={`
        grid grid-cols-12 gap-4 p-4 items-center transition-colors group
        ${player.isUser
          ? 'bg-[#003DA5]/10 border-l-4 border-l-[#003DA5]'
          : 'hover:bg-white/5 border-l-4 border-l-transparent'
        }
      `}
    >
      {/* Rank */}
      <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-1">
        {isTopThree ? (
          <>
            <Image
              src={crownSrc}
              alt={player.rank === 1 ? 'Rank 1 crown' : 'Top 3 crown'}
              width={24}
              height={24}
              className={`w-5 h-5 md:w-6 md:h-6 ${crownGlowClass}`}
            />
            <span className="font-mono text-gray-400 font-bold text-xs">
              {player.rank}
            </span>
          </>
        ) : (
          <span className="font-mono text-gray-400 font-bold">
            {player.rank}
          </span>
        )}
        <RankChange type={player.change} amount={player.change !== 'same' ? 2 : undefined} />
      </div>

      {/* Player Info */}
      <div className="col-span-7 md:col-span-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={DEFAULT_AVATAR_SRC}
              alt={`${player.name}'s avatar`}
              width={40}
              height={40}
              className={`w-10 h-10 rounded-full bg-[#0F1B2E] border ${
                player.isUser ? 'border-[#003DA5]' : 'border-gray-700'
              }`}
            />
            {player.isUser && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#003DA5] rounded-full border border-black" />
            )}
          </div>
          <div>
            <div
              className={`font-bold text-sm md:text-base flex items-center gap-2 ${
                player.isUser ? 'text-[#003DA5]' : 'text-white'
              }`}
            >
              {player.name}
              {player.isUser && (
                <span className="text-[10px] bg-[#003DA5] text-white px-1.5 py-0.5 rounded uppercase">
                  You
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-mono">{player.tag}</span> •{' '}
              <span className="text-gray-400">{player.universityShort}</span>
            </div>
          </div>
        </div>
      </div>

      {/* POWER LEVEL */}
      <div className="col-span-3 md:col-span-3 text-right md:text-left">
        <div className="flex items-center justify-end md:justify-start gap-1 font-bold text-[#FFD700] text-lg">
          <Image src={XP_ICON_SRC} alt="XP" width={16} height={16} className="w-4 h-4" />
          <span>{player.score}</span>
        </div>
        <div className="text-[10px] text-gray-500 md:hidden">Power Level</div>
      </div>


      {/* POL Current League */}
      <div className="hidden md:block col-span-1 text-right">
        <div className="text-gray-300 font-mono">
          {player.polCurrentLeague > 0 ? `L${player.polCurrentLeague}` : '-'}
        </div>
      </div>

      {/* Trophies (Hidden Mobile) */}
      <div className="hidden md:block col-span-2 text-right">
        <div className="flex items-center justify-end gap-1 text-gray-300 font-mono">
          <Trophy size={14} className="text-gray-500" />
          {player.trophies.toLocaleString()}
        </div>
      </div>

      {/* Wins (Hidden Mobile) */}
      <div className="hidden md:block col-span-1 text-right">
        <div className="text-gray-400 font-mono">{player.wins}</div>
      </div>
    </div>
  );
}
