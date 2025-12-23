import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getVerificationStatus } from '@/lib/auth/verification.server';
import { requireAuth } from '@/lib/auth/session.server';
import { AuthLayout, VerifyForm } from '@/components/auth';

/**
 * Verification Page
 *
 * Users are redirected here after login/signup if they haven't verified
 * their Clash Royale account. They must complete Supercell ID verification
 * before accessing the rest of the app.
 */
export default async function VerifyPage() {
  // Require authentication (redirects to /login if not authenticated)
  const user = await requireAuth();
  
  // Check verification status
  const verificationStatus = await getVerificationStatus(user.id);
  
  // If already verified, redirect to rankings
  if (verificationStatus.isVerified) {
    redirect('/rankings');
  }
  
  return (
    <AuthLayout
      title="Verify Your Identity"
      subtitle="Link your Clash Royale account to compete on campus."
    >
      <VerifyForm />
    </AuthLayout>
  );
}

