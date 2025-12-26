import { redirect } from 'next/navigation';
import { AuthLayout, SignUpForm } from '@/components/auth';
import { getAuthenticatedUser } from '@/lib/auth/session.server';

/**
 * Sign Up Page
 *
 * Allows new users to create an account on ClashCampus.
 * Features a glass morphism card with form fields for university email,
 * password, and confirm password. No backend logic implemented yet.
 */
export default async function SignUpPage() {
  const { user } = await getAuthenticatedUser();
  if (user) {
    redirect('/profile');
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
