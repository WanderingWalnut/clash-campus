import { redirect } from 'next/navigation';
import { AuthLayout, SignUpForm } from '@/components/auth';
import { getAuthenticatedUser } from '@/lib/auth/session.server';
import { getAccountDestination, getSafeNextPath } from '@/lib/auth/behaviour';
import { getVerificationStatus } from '@/lib/auth/verification.server';

type SignUpPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

/**
 * Sign Up Page
 *
 * Allows new users to create an account on ClashCampus.
 * Features a glass morphism card with form fields for university email,
 * password, and confirm password.
 */
export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const [{ user }, params] = await Promise.all([
    getAuthenticatedUser(),
    searchParams,
  ]);

  if (user) {
    const requestedPath = getSafeNextPath(
      Array.isArray(params.next) ? params.next[0] : params.next
    );
    const status = await getVerificationStatus(user.id);
    redirect(getAccountDestination(status.isVerified, requestedPath));
  }

  return (
    <AuthLayout
      title="Join the Arena"
      subtitle="Create your account and claim your rank on campus."
    >
      <SignUpForm />
    </AuthLayout>
  );
}
