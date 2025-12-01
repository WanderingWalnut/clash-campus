'use client';

import { Users } from 'lucide-react';
import { RankChange } from './RankChange';
import type { RankedCampus } from '@/types/rankings';

interface CampusesTableProps {
  /** Array of campus data to display */
  campuses: RankedCampus[];
}

/**
 * Displays the campus/university leaderboard table with rankings and stats.
 *
 * @param campuses - Array of RankedCampus objects to display
 */
export function CampusesTable({ campuses }: CampusesTableProps) {
  return (
    <div className="bg-[#141414] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-gray-900/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
        <div className="col-span-7 md:col-span-4">University</div>
        <div className="col-span-3 md:col-span-3 text-right md:text-left">
          Avg Score
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

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/30 text-center">
        <button className="text-xs text-gray-400 hover:text-white uppercase tracking-widest font-bold">
          Show More
        </button>
      </div>
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
  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer border-l-4 border-l-transparent hover:border-l-[#FFD700]">
      {/* Rank */}
      <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-1">
        <span
          className={`font-mono font-bold text-lg ${
            campus.rank === 1 ? 'text-[#FFD700]' : 'text-gray-400'
          }`}
        >
          #{campus.rank}
        </span>
        <RankChange type={campus.change} />
      </div>

      {/* Campus Info */}
      <div className="col-span-7 md:col-span-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
            🏛️
          </div>
          <div>
            <div className="font-bold text-white text-sm md:text-base group-hover:text-[#FFD700] transition-colors">
              {campus.name}
            </div>
            <div className="text-xs text-gray-500">Top 1% Global</div>
          </div>
        </div>
      </div>

      {/* Avg Score */}
      <div className="col-span-3 md:col-span-3 text-right md:text-left">
        <div className="font-bold text-white text-lg">{campus.avgScore}</div>
        <div className="text-[10px] text-gray-500">Avg Composite</div>
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
        <div className="text-[#4717F6] text-sm font-medium">
          {campus.topPlayer}
        </div>
        <div className="text-[10px] text-gray-500">Campus Captain</div>
      </div>
    </div>
  );
}

