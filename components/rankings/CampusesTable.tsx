'use client';

import Image from 'next/image';
import { Users } from 'lucide-react';
import { RankChange } from './RankChange';
import type { RankedCampus } from '@/types/rankings';

const BLUE_CROWN_SRC = '/assets/images/Blue_Crown/image.png';
const RED_CROWN_SRC = '/assets/images/Red_crown/image.png';
const XP_ICON_SRC = '/assets/images/XP/image.png';

interface CampusesTableProps {
  /** Array of campus data to display */
  campuses: RankedCampus[];
  /** Whether more campuses can be loaded */
  hasMore: boolean;
  /** Callback to load more campuses */
  onShowMore: () => void;
  /** Whether an additional batch is loading */
  isLoadingMore?: boolean;
}

/**
 * Displays the campus/university leaderboard table with rankings and stats.
 *
 * @param campuses - Array of RankedCampus objects to display
 */
export function CampusesTable({
  campuses,
  hasMore,
  onShowMore,
  isLoadingMore = false,
}: CampusesTableProps) {
  return (
    <div className="bg-[#1B2637] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
        <div className="col-span-7 md:col-span-4">University</div>
        <div className="col-span-3 md:col-span-3 text-right md:text-left">
          Avg Power Level
        </div>
        <div className="hidden md:block col-span-2 text-right">
          Active Players
        </div>
        <div className="hidden md:block col-span-2 text-right">Top Player</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-800">
        {campuses.map((campus) => (
          <CampusRow key={campus.rank} campus={campus} />
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

interface CampusRowProps {
  campus: RankedCampus;
}

/**
 * Individual row in the campuses table.
 *
 * @param campus - The campus data to display (RankedCampus)
 */
function CampusRow({ campus }: CampusRowProps) {
  const isTopThree = campus.rank <= 3;
  const crownSrc = campus.rank === 1 ? BLUE_CROWN_SRC : RED_CROWN_SRC;
  const crownGlowClass =
    campus.rank === 1
      ? 'drop-shadow-[0_0_8px_rgba(0,61,165,0.45)]'
      : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.45)]';

  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer border-l-4 border-l-transparent hover:border-l-[#FFD700]">
      {/* Rank */}
      <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-1">
        {isTopThree ? (
          <>
            <Image
              src={crownSrc}
              alt={campus.rank === 1 ? 'Rank 1 crown' : 'Top 3 crown'}
              width={24}
              height={24}
              className={`w-5 h-5 md:w-6 md:h-6 ${crownGlowClass}`}
            />
            <span className="font-mono text-gray-400 font-bold text-xs">
              {campus.rank}
            </span>
          </>
        ) : (
          <span className="font-mono font-bold text-sm md:text-lg text-gray-400">
            #{campus.rank}
          </span>
        )}
        <RankChange type={campus.change} />
      </div>

      {/* Campus Info */}
      <div className="col-span-7 md:col-span-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center text-sm md:text-lg">
            🏛️
          </div>
          <div>
            <div className="font-bold text-white text-xs md:text-base group-hover:text-[#FFD700] transition-colors">
              {campus.name}
            </div>
            <div className="text-xs text-gray-500">Top 1% Global</div>
          </div>
        </div>
      </div>

      {/* Avg Power Level */}
      <div className="col-span-3 md:col-span-3 text-right md:text-left">
        <div className="flex items-center justify-end md:justify-start font-bold text-white text-sm md:text-lg">
          <Image src={XP_ICON_SRC} alt="XP" width={25} height={25} className="w-6 h-6 md:w-10 md:h-10" />
          <span>{campus.avgScore}</span>
        </div>
      </div>

      {/* Active Players */}
      <div className="hidden md:block col-span-2 text-right">
        <div className="flex items-center justify-end gap-1 text-gray-300">
          <Users size={14} className="text-gray-500" />
          {campus.activePlayers}
        </div>
      </div>

      {/* Top Player */}
      <div className="hidden md:block col-span-2 text-right">
        <div className="text-[#003DA5] text-sm font-medium">
          {campus.topPlayer}
        </div>
        <div className="text-[10px] text-gray-500">Campus Captain</div>
      </div>
    </div>
  );
}
