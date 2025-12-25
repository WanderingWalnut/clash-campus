'use client';

import Image from 'next/image';
import { Crown, Trophy } from 'lucide-react';
import { RankChange } from './RankChange';
import type { RankedPlayer } from '@/types/rankings';

interface PlayersTableProps {
  /** Array of player data to display */
  players: RankedPlayer[];
}

/**
 * Displays the players leaderboard table with rankings, scores, and stats.
 *
 * @param players - Array of RankedPlayer objects to display
 */
export function PlayersTable({ players }: PlayersTableProps) {
  return (
    <div className="bg-[#141414] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
        <div className="col-span-7 md:col-span-4">Player</div>
        <div className="col-span-3 md:col-span-3 text-right md:text-left">
          Composite Score
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

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/30 text-center">
        <button className="text-xs text-gray-400 hover:text-white uppercase tracking-widest font-bold">
          Show More
        </button>
      </div>
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

  return (
    <div
      className={`
        grid grid-cols-12 gap-4 p-4 items-center transition-colors group
        ${player.isUser
          ? 'bg-[#4717F6]/10 border-l-4 border-l-[#4717F6]'
          : 'hover:bg-white/5 border-l-4 border-l-transparent'
        }
      `}
    >
      {/* Rank */}
      <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-1">
        {isTopThree ? (
          <Crown
            size={20}
            className={
              player.rank === 1
                ? 'text-[#FFD700]'
                : player.rank === 2
                ? 'text-gray-300'
                : 'text-amber-700'
            }
          />
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
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
              alt={`${player.name}'s avatar`}
              width={40}
              height={40}
              className={`w-10 h-10 rounded-full bg-gray-800 border ${
                player.isUser ? 'border-[#4717F6]' : 'border-gray-700'
              }`}
            />
            {player.isUser && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#4717F6] rounded-full border border-black" />
            )}
          </div>
          <div>
            <div
              className={`font-bold text-sm md:text-base flex items-center gap-2 ${
                player.isUser ? 'text-[#4717F6]' : 'text-white'
              }`}
            >
              {player.name}
              {player.isUser && (
                <span className="text-[10px] bg-[#4717F6] text-white px-1.5 py-0.5 rounded uppercase">
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

      {/* Composite Score */}
      <div className="col-span-3 md:col-span-3 text-right md:text-left">
        <div className="font-bold text-[#FFD700] text-lg">{player.score}</div>
        <div className="text-[10px] text-gray-500 md:hidden">Composite</div>
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

