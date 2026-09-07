import { redirect } from 'next/navigation';
import { AuthLayout, LoginForm } from '@/components/auth';
import { getAuthenticatedUser } from '@/lib/auth/session.server';
import { getAccountDestination, getSafeNextPath } from '@/lib/auth/behaviour';
import { getVerificationStatus } from '@/lib/auth/verification.server';

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    reset?: string | string[];
  }>;
};

/**
 * Login Page
 *
 * Allows existing users to log in to their ClashCampus account.
 * Features a glass morphism card with email and password fields.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ user }, params] = await Promise.all([
    getAuthenticatedUser(),
    searchParams,
  ]);
  const requestedPath = getSafeNextPath(
    Array.isArray(params.next) ? params.next[0] : params.next
  );

  if (user) {
    const status = await getVerificationStatus(user.id);
    redirect(getAccountDestination(status.isVerified, requestedPath));
  }

  const resetSucceeded =
    (Array.isArray(params.reset) ? params.reset[0] : params.reset) === 'success';

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to check your rankings and defend your status."
    >
      <LoginForm
        nextPath={requestedPath}
        successMessage={resetSucceeded ? 'Password reset. Log in with your new password.' : null}
      />
    </AuthLayout>
  );
}
