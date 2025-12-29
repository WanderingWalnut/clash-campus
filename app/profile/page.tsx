import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ProfileCard } from '@/components/profile'
import { Footer } from '@/components/landing'
import { requireAuth } from '@/lib/auth/session.server'
import { getUserProfile } from '@/lib/profile/profile.server'

export const metadata: Metadata = {
  title: 'Your Profile | ClashCampus',
  description:
    'View your Clash Royale profile, campus rank, and performance stats on ClashCampus.',
  openGraph: {
    title: 'Your Profile | ClashCampus',
    description:
      'View your Clash Royale profile, campus rank, and performance stats on ClashCampus.',
  },
}

interface NoticeCardProps {
  title: string
  description: string
  action?: ReactNode
}

function NoticeCard({ title, description, action }: NoticeCardProps) {
  return (
    <div className="mt-6 bg-[#1B2637] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-widest text-gray-500">Status</div>
        <div className="text-xl font-bold text-white mt-1">{title}</div>
        <p className="text-gray-400 mt-2">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

function EmptyState({ title, description, action }: NoticeCardProps) {
  return (
    <div className="bg-[#1B2637] border border-gray-800 rounded-2xl p-10 text-center">
      <div className="text-xs uppercase tracking-widest text-gray-500">Profile</div>
      <div className="text-2xl md:text-3xl font-bold text-white mt-2">
        {title}
      </div>
      <p className="text-gray-400 mt-3">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const result = await getUserProfile(user.id)

  let content: ReactNode

  if (result.status === 'missing-profile') {
    content = (
      <EmptyState
        title="Complete your profile"
        description="We couldn't find your profile details yet. Head back to the homepage and try again in a moment."
        action={
          <Link
            href="/"
            className="button-royale text-white px-6 py-3 rounded-lg font-bold transition-transform duration-300 hover:-translate-y-0.5"
          >
            Return Home
          </Link>
        }
      />
    )
  } else if (result.status === 'missing-university') {
    content = (
      <EmptyState
        title="Add your university"
        description="Your profile isn't linked to a campus yet. Update your university to unlock rankings."
        action={
          <Link
            href="/signup"
            className="bg-[#FFD700] hover:bg-[#f0c000] text-black px-6 py-3 rounded-lg font-bold transition-all"
          >
            Update Profile
          </Link>
        }
      />
    )
  } else if (result.status === 'error') {
    content = (
      <EmptyState
        title="Profile unavailable"
        description="We're having trouble loading your stats right now. Please try again soon."
      />
    )
  } else {
    const profile = result.profile

    let notice: ReactNode = null
    if (result.status === 'missing-clash-account') {
      notice = (
        <NoticeCard
          title="Verify your Clash Royale account"
          description="Link your in-game account to unlock stats, trophies, and campus rankings."
          action={
            <Link
              href="/verify"
              className="button-royale text-white px-6 py-3 rounded-lg font-bold transition-transform duration-300 hover:-translate-y-0.5"
            >
              Start Verification
            </Link>
          }
        />
      )
    } else if (profile.clashAccount && !profile.clashAccount.verified) {
      notice = (
        <NoticeCard
          title="Finish verification"
          description="Your Clash Royale account is linked but not verified yet. Complete the verification flow to appear on leaderboards."
          action={
            <Link
              href="/verify"
              className="bg-[#FFD700] hover:bg-[#f0c000] text-black px-6 py-3 rounded-lg font-bold transition-all"
            >
              Continue Verification
            </Link>
          }
        />
      )
    } else if (!profile.rankings) {
      notice = (
        <NoticeCard
          title="Stats syncing"
          description="We're still pulling in your latest Clash Royale stats. Check back soon for full rankings."
        />
      )
    }

    content = (
      <div>
        <ProfileCard profile={profile} />
        {notice}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F1B2E] pt-28">
      <div className="flex-1">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow opacity-20" />
          <div className="absolute inset-0 bg-royale-pattern opacity-15" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="mb-10">
              <span className="text-xs uppercase tracking-widest text-[#FFD700] font-bold">
                Profile
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-3">
                Your Campus Identity
              </h1>
              <p className="text-gray-400 mt-3 max-w-2xl">
                Track your Clash Royale performance, trophies, and campus rank in one place.
              </p>
            </div>
            {content}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
