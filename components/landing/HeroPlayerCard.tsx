import { Crown, Trophy, Medal } from 'lucide-react';

/**
 * Floating player card component displayed in the hero section.
 * Shows a preview of what a player's profile card looks like.
 */
export function HeroPlayerCard() {
  return (
    <div className="mt-16 w-full max-w-4xl relative perspective-1000">
      {/* Main Card */}
      <div className="relative z-20 bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-2xl animate-float mx-auto max-w-sm md:max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-orange-500 flex items-center justify-center font-bold text-black text-xs">
              K
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">KingSlayer_99</div>
              <div className="text-xs text-gray-400">Ontario Tech University</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#FFD700]">
            <Trophy size={16} />
            <span className="font-bold">7,842</span>
          </div>
        </div>

        <div className="h-32 bg-gray-900 rounded-lg mb-4 flex items-center justify-center border border-gray-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#4717F6]/20 group-hover:bg-[#4717F6]/10 transition-colors" />
          <span className="relative z-10 text-sm font-mono text-[#FFD700] tracking-widest uppercase">
            Ultimate Champion
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500 uppercase">Win Rate</div>
            <div className="font-bold text-[#4717F6]">68%</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500 uppercase">Global</div>
            <div className="font-bold text-white">#402</div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500 uppercase">Campus</div>
            <div className="font-bold text-[#FFD700]">#1</div>
          </div>
        </div>
      </div>

      {/* Floating Badge - Left */}
      <div className="hidden md:flex absolute top-1/2 -left-4 lg:-left-12 bg-black border border-[#FFD700]/30 rounded-xl p-3 items-center gap-3 shadow-xl transform -translate-y-1/2 -rotate-6 z-10">
        <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center">
          <Crown size={16} className="text-black" />
        </div>
        <div>
          <div className="text-xs text-gray-400">Current Status</div>
          <div className="text-sm font-bold text-white">Top 1% Campus</div>
        </div>
      </div>

      {/* Floating Badge - Right */}
      <div className="hidden md:flex absolute top-1/3 -right-4 lg:-right-12 bg-black border border-[#4717F6]/30 rounded-xl p-3 items-center gap-3 shadow-xl transform -translate-y-1/2 rotate-6 z-10">
        <div className="w-8 h-8 rounded-full bg-[#4717F6] flex items-center justify-center">
          <Medal size={16} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-gray-400">Win Streak</div>
          <div className="text-sm font-bold text-white">12 Games</div>
        </div>
      </div>
    </div>
  );
}

