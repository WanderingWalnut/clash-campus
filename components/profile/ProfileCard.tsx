import Image from 'next/image'
import { Crown, Medal, Trophy } from 'lucide-react'
import { getPathOfLegendsLeagueName } from '@/lib/clash-royale/league'
import type { UserProfile } from '@/types/profile'

const DEFAULT_AVATAR_SRC = '/assets/images/default_profile/image.png'

interface ProfileCardProps {
  profile: UserProfile
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'N/A'
  }

  return value.toLocaleString()
}

function getSafeAvatarUrl(avatarUrl: string | null) {
  if (!avatarUrl) {
    return DEFAULT_AVATAR_SRC
  }

  if (avatarUrl.startsWith('/')) {
    return avatarUrl
  }

  try {
    const url = new URL(avatarUrl)
    const hostname = url.hostname

    if (hostname === 'api.dicebear.com') {
      return avatarUrl
    }

    if (hostname.endsWith('.supabase.co') || hostname.endsWith('.clashroyale.com')) {
      return avatarUrl
    }
  } catch {
    return DEFAULT_AVATAR_SRC
  }

  return DEFAULT_AVATAR_SRC
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const displayName =
    profile.profile.username ?? profile.clashAccount?.name ?? 'Unknown Player'
  const safeAvatarUrl = getSafeAvatarUrl(profile.profile.avatarUrl)
  const universityName = profile.university?.name ?? 'Unknown University'
  const playerTag = profile.clashAccount?.playerTag
  const isVerified = profile.clashAccount?.verified === true

  const trophiesLabel = formatNumber(profile.rankings?.currentTrophies)
  const bestTrophiesLabel = formatNumber(profile.rankings?.bestTrophies)
  const winRateLabel =
    profile.winRate !== null ? `${Math.round(profile.winRate)}%` : 'N/A'
  const campusRankLabel =
    profile.campusRank !== null
      ? `#${profile.campusRank}`
      : profile.rankings
        ? 'Unranked'
        : 'N/A'

  const leagueLabel = profile.rankings
    ? getPathOfLegendsLeagueName(profile.rankings.polCurrentLeague)
    : profile.clashAccount
      ? 'Stats Incoming'
      : 'Verify to Unlock Stats'

  const statusValue = profile.clashAccount
    ? profile.campusRank !== null
      ? `Campus #${profile.campusRank}`
      : profile.rankings
        ? 'Campus Unranked'
        : 'Awaiting Stats'
    : 'Link Account'

  const achievementValue = profile.rankings
    ? getPathOfLegendsLeagueName(profile.rankings.polBestLeague)
    : 'No Record'

  return (
    <div className="mt-10 w-full max-w-4xl relative mx-auto">
      <div className="relative z-20 bg-[#1A2332] border border-gray-800 rounded-2xl p-6 shadow-2xl mx-auto max-w-md overflow-hidden">
        <div className="absolute inset-0 bg-royale-pattern opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image
                src={safeAvatarUrl}
                alt={`${displayName} avatar`}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-gray-700 bg-[#0F1B2E]"
              />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-white">
                    {displayName}
                  </div>
                  {profile.clashAccount ? (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                        isVerified
                          ? 'bg-[#FFD700] text-black'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-gray-400">{universityName}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {playerTag ?? 'Clash account not linked'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#FFD700]">
              <Trophy size={16} />
              <span className="font-bold">{trophiesLabel}</span>
            </div>
          </div>

          <div className="h-32 bg-[#0F1B2E] rounded-lg mb-4 flex items-center justify-center border border-gray-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#003DA5]/20 group-hover:bg-[#003DA5]/10 transition-colors" />
            <span className="relative z-10 text-sm font-mono text-[#FFD700] tracking-widest uppercase">
              {leagueLabel}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-xs text-gray-500 uppercase">Win Rate</div>
              <div className="font-bold text-[#003DA5]">{winRateLabel}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-xs text-gray-500 uppercase">Campus</div>
              <div className="font-bold text-[#FFD700]">{campusRankLabel}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-xs text-gray-500 uppercase">Best Trophies</div>
              <div className="font-bold text-white">{bestTrophiesLabel}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex absolute top-1/2 -left-4 lg:-left-12 bg-black border border-[#FFD700]/30 rounded-xl p-3 items-center gap-3 shadow-xl transform -translate-y-1/2 -rotate-6 z-10">
        <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center">
          <Crown size={16} className="text-black" />
        </div>
        <div>
          <div className="text-xs text-gray-400">Current Status</div>
          <div className="text-sm font-bold text-white">{statusValue}</div>
        </div>
      </div>

      <div className="hidden md:flex absolute top-1/3 -right-4 lg:-right-12 bg-black border border-[#003DA5]/30 rounded-xl p-3 items-center gap-3 shadow-xl transform -translate-y-1/2 rotate-6 z-10">
        <div className="w-8 h-8 rounded-full bg-[#003DA5] flex items-center justify-center">
          <Medal size={16} className="text-white" />
        </div>
        <div>
          <div className="text-xs text-gray-400">Achievement</div>
          <div className="text-sm font-bold text-white">{achievementValue}</div>
        </div>
      </div>
    </div>
  )
}
