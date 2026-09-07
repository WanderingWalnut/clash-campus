import Image from 'next/image';
import { Users } from 'lucide-react';
import { RankChange } from '@/components/rankings/RankChange';
import type { RankedCampus } from '@/types/rankings';

const BLUE_CROWN_SRC = '/assets/images/Blue_Crown/image.png';
const RED_CROWN_SRC = '/assets/images/Red_crown/image.png';
const XP_ICON_SRC = '/assets/images/XP/image.png';

interface CampusesPreviewTableProps {
  campuses: RankedCampus[];
}

/**
 * Server-rendered, non-interactive preview of the campuses table.
 * Used on the landing page to avoid client-side data fetching/hydration delays.
 */
export function CampusesPreviewTable({ campuses }: CampusesPreviewTableProps) {
  return (
    <div className="bg-[#1B2637] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
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

      <div className="divide-y divide-gray-800">
        {campuses.map((campus) => (
          <CampusPreviewRow
            key={`${campus.short}-${campus.name}`}
            campus={campus}
          />
        ))}
      </div>
    </div>
  );
}

function CampusPreviewRow({ campus }: { campus: RankedCampus }) {
  const isTopThree = campus.rank <= 3;
  const crownSrc = campus.rank === 1 ? BLUE_CROWN_SRC : RED_CROWN_SRC;
  const crownGlowClass =
    campus.rank === 1
      ? 'drop-shadow-[0_0_8px_rgba(0,61,165,0.45)]'
      : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.45)]';

  return (
    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group border-l-4 border-l-transparent hover:border-l-[#FFD700]">
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

      <div className="col-span-7 md:col-span-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center text-sm md:text-lg">
            🏛️
          </div>
          <div>
            <div className="font-bold text-white text-xs md:text-base group-hover:text-[#FFD700] transition-colors">
              {campus.name}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-3 md:col-span-3 text-right md:text-left">
        <div className="flex items-center justify-end md:justify-start font-bold text-[#FFD700] text-sm md:text-lg">
          <Image
            src={XP_ICON_SRC}
            alt="XP"
            width={25}
            height={25}
            className="w-6 h-6 md:w-10 md:h-10"
          />
          <span>{campus.avgScore}</span>
        </div>
      </div>

      <div className="hidden md:block col-span-2 text-right">
        <div className="flex items-center justify-end gap-1 text-gray-300">
          <Users size={14} className="text-gray-500" />
          {campus.activePlayers}
        </div>
      </div>

      <div className="hidden md:block col-span-2 text-right">
        <div className="text-[#003DA5] text-sm font-medium">{campus.topPlayer}</div>
        <div className="text-[10px] text-gray-500">Campus Captain</div>
      </div>
    </div>
  );
}

