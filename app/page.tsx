import { redirect } from 'next/navigation';
import {
  Hero,
  RoyaleRankings,
  Features,
  Roadmap,
  CallToAction,
  Footer,
} from '@/components/landing';
import { getAuthenticatedUser } from '@/lib/auth/session.server';
import { shouldRedirectToVerify } from '@/lib/auth/verification.server';

/**
 * ClashCampus Landing Page
 *
 * The main entry point for ClashCampus. Displays the marketing landing page
 * with hero section, leaderboard preview, features, roadmap, and CTAs.
 * 
 * For authenticated users who haven't verified their Clash Royale account,
 * redirects to /verify to complete the verification flow.
 *
 * @returns The complete landing page composed of modular sections
 */
export default async function LandingPage() {
  // Check if user is authenticated
  const { user } = await getAuthenticatedUser();

  // If authenticated, check if they need to verify their Clash account
  // This ensures logged-in but unverified users are directed to complete verification
  if (user) {
    const needsVerify = await shouldRedirectToVerify(user.id);
    if (needsVerify) {
      redirect('/verify');
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Hero />
      <RoyaleRankings />
      <Features />
      <Roadmap />
      <CallToAction />
      <Footer />
    </div>
  );
}
