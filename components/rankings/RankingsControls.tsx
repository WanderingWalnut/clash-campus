'use client';

import { Zap, Landmark, Search, Filter, ChevronDown } from 'lucide-react';
import type { RankingsMode } from '@/types/rankings';

interface RankingsControlsProps {
  /** Current view mode (players or campuses) */
  mode: RankingsMode;
  /** Callback when mode is changed */
  onModeChange: (mode: RankingsMode) => void;
  /** Current search query */
  searchQuery: string;
  /** Callback when search changes */
  onSearchChange: (value: string) => void;
}

/**
 * Control bar for the rankings page containing mode toggle, search, and filters.
 * Sticky positioned below the navigation when scrolling.
 *
 * @param mode - Current view mode ('players' | 'campuses')
 * @param onModeChange - Callback function when mode changes ((mode: RankingsMode) => void)
 */
export function RankingsControls({
  mode,
  onModeChange,
  searchQuery,
  onSearchChange,
}: RankingsControlsProps) {
  return (
    <div className="sticky top-20 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-gray-800 pb-4 pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mode Toggle & Search Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          {/* Toggle */}
          <ModeToggle mode={mode} onModeChange={onModeChange} />

          {/* Search */}
          <SearchInput
            mode={mode}
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>

        {/* Filters Row */}
        {/* <FiltersRow mode={mode} /> */}
      </div>
    </div>
  );
}

interface ModeToggleProps {
  mode: RankingsMode;
  onModeChange: (mode: RankingsMode) => void;
}

/**
 * Toggle button group for switching between Players and Campuses views.
 */
function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="bg-gray-900/80 p-1 rounded-lg flex items-center border border-gray-800">
      <button
        onClick={() => onModeChange('players')}
        className={`
          px-6 py-2 rounded-md text-sm font-bold transition-all duration-300 
          flex items-center gap-2
          ${mode === 'players' 
            ? 'bg-[#4717F6] text-white shadow-lg' 
            : 'text-gray-400 hover:text-white'
          }
        `}
      >
        <Zap size={16} /> Players
      </button>
      <button
        onClick={() => onModeChange('campuses')}
        className={`
          px-6 py-2 rounded-md text-sm font-bold transition-all duration-300 
          flex items-center gap-2
          ${mode === 'campuses' 
            ? 'bg-[#4717F6] text-white shadow-lg' 
            : 'text-gray-400 hover:text-white'
          }
        `}
      >
        <Landmark size={16} /> Campuses
      </button>
    </div>
  );
}

interface SearchInputProps {
  mode: RankingsMode;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Search input field with dynamic placeholder based on current mode.
 */
function SearchInput({ mode, value, onChange }: SearchInputProps) {
  const placeholder =
    mode === 'players'
      ? 'Search by player name or tag...'
      : 'Search universities...';

  return (
    <div className="relative w-full md:w-96">
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        size={18}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-[#141414] border border-gray-800 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-[#4717F6] transition-colors"
      />
    </div>
  );
}

interface FiltersRowProps {
  mode: RankingsMode;
}

/**
 * Row of filter buttons and update timer.
 */
// function FiltersRow({ mode }: FiltersRowProps) {
//   return (
//     <div className="flex flex-wrap gap-3 items-center">
//       <button className="flex items-center gap-2 bg-[#141414] border border-gray-800 px-4 py-2 rounded-lg text-sm text-gray-300 hover:border-gray-600 transition-colors">
//         <Filter size={14} />
//         {mode === 'players' ? 'University: All' : 'Region: Global'}
//         <ChevronDown size={14} />
//       </button>
//       <button className="flex items-center gap-2 bg-[#141414] border border-gray-800 px-4 py-2 rounded-lg text-sm text-gray-300 hover:border-gray-600 transition-colors">
//         Season: Nov 2025 (Current) <ChevronDown size={14} />
//       </button>
//       <div className="flex-grow" />
//       <div className="text-xs text-gray-500 font-mono hidden md:block">
//         NEXT UPDATE IN: 04:12:33
//       </div>
//     </div>
//   );
// }
