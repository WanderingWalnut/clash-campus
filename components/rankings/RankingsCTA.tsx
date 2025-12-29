/**
 * Call-to-action section at the bottom of the rankings page.
 * Encourages users to join and help their campus climb the rankings.
 * Server component - uses Next.js Link for navigation (no client-side JS needed).
 */
import Link from 'next/link';

export function RankingsCTA() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-gradient-to-r from-[#1B2637] to-[#0F1B2E] border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#FFD700] opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />

        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white mb-2">
            Think your campus deserves a higher rank?
          </h3>
          <p className="text-gray-400 mb-6">
            Join ClashCampus, link your account, and help your university climb
            the Royale Rankings.
          </p>
          <Link
            href="/signup"
            className="button-royale inline-block text-white px-8 py-3 rounded-lg font-bold transition-transform duration-300 hover:-translate-y-0.5"
          >
            Claim Your Spot
          </Link>
        </div>
      </div>
    </div>
  );
}
