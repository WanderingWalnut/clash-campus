'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import type { LeaderboardPlayer } from '@/types/landing';

/** Sample leaderboard data for the landing page preview */
const SAMPLE_PLAYERS: LeaderboardPlayer[] = [
  {
    rank: 1,
    name: 'NovaBreaker',
    university: 'Massachusetts Inst. Tech',
    universityShort: 'MIT',
    favoriteCard: 'P.E.K.K.A',
    trophies: '9,000',
    avatarSeed: 'Felix',
    isHighlighted: true,
  },
  {
    rank: 2,
    name: 'LogBaitGod',
    university: 'UCLA',
    universityShort: 'UCLA',
    favoriteCard: 'Princess',
    trophies: '8,840',
    avatarSeed: 'Annie',
    isHighlighted: false,
  },
  {
    rank: 3,
    name: 'HogRider22',
    university: 'UT Austin',
    universityShort: 'UT Austin',
    favoriteCard: 'Hog Rider',
    trophies: '8,520',
    avatarSeed: 'Jack',
    isHighlighted: false,
  },
];

/**
 * Royale Rankings section displaying a preview of the leaderboard.
 * Shows top 3 players with their stats, universities, and favorite cards.
 * Links to the full rankings page.
 */
export function RoyaleRankings() {
  return (
    <section id="rankings" className="py-12 md:py-24 bg-[#141414] relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4">
              Royale <span className="text-[#FFD700]">Rankings</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
              Your leaderboard. Your reputation. See who actually runs the arena
              at your university.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="glass rounded-xl md:rounded-2xl border border-gray-800 overflow-hidden">
            {/* Table Header */}
            <LeaderboardHeader />

            {/* Table Rows */}
            {SAMPLE_PLAYERS.map((player) => (
              <LeaderboardRow key={player.rank} player={player} />
            ))}
          </div>
        </Reveal>

        <div className="mt-6 md:mt-8 text-center">
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 text-[#4717F6] hover:text-white transition-colors text-xs md:text-sm font-bold uppercase tracking-widest"
          >
            View Full Leaderboard <ArrowRight size={14} className="md:w-4 md:h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Header row for the leaderboard table.
 */
function LeaderboardHeader() {
  return (
    <div className="grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-5 border-b border-gray-800 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
      <div className="col-span-2 md:col-span-1 text-center">Rank</div>
      <div className="col-span-6 md:col-span-4">Player</div>
      <div className="col-span-4 md:col-span-3 hidden md:block">University</div>
      <div className="col-span-3 md:col-span-2 hidden md:block">
        Favorite Card
      </div>
      <div className="col-span-4 md:col-span-2 text-right">Trophies</div>
    </div>
  );
}

interface LeaderboardRowProps {
  player: LeaderboardPlayer;
}

/**
 * Individual row in the leaderboard table.
 * Clicking a row navigates to the full rankings page.
 *
 * @param player - The player data to display (LeaderboardPlayer)
 */
function LeaderboardRow({ player }: LeaderboardRowProps) {
  return (
    <Link
      href="/rankings"
      className="grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-5 border-b border-gray-800 items-center hover:bg-white/5 transition-colors cursor-pointer group"
    >
      {/* Rank */}
      <div className="col-span-2 md:col-span-1 flex justify-center">
        {player.isHighlighted ? (
          <Crown
            size={20}
            className="text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] md:w-6 md:h-6"
          />
        ) : (
          <span
            className={`font-bold text-base md:text-xl ${
              player.rank === 2 ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {player.rank}
          </span>
        )}
      </div>

      {/* Player Info */}
      <div className="col-span-6 md:col-span-4 flex items-center gap-2 md:gap-3">
        <Image
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.avatarSeed}`}
          alt={`${player.name}'s avatar`}
          width={40}
          height={40}
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full border bg-gray-800 ${
            player.isHighlighted ? 'border-[#FFD700]' : 'border-gray-600'
          }`}
        />
        <div>
          <div
            className={`text-sm md:text-base font-bold ${
              player.isHighlighted
                ? 'group-hover:text-[#FFD700]'
                : 'text-white group-hover:text-gray-300'
            } transition-colors`}
          >
            {player.name}
          </div>
          <div className="text-[10px] md:text-xs text-gray-500 md:hidden">
            {player.universityShort}
          </div>
        </div>
      </div>

      {/* University */}
      <div className="col-span-4 md:col-span-3 hidden md:block text-sm text-gray-300">
        {player.university}
      </div>

      {/* Favorite Card */}
      <div className="col-span-3 md:col-span-2 hidden md:block">
        <span className="bg-gray-800 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded border border-gray-700">
          {player.favoriteCard}
        </span>
      </div>

      {/* Trophies */}
      <div
        className={`col-span-4 md:col-span-2 text-right font-mono font-bold text-sm md:text-lg ${
          player.isHighlighted ? 'text-[#FFD700]' : 'text-white'
        }`}
      >
        {player.trophies}
      </div>
    </Link>
  );
}
