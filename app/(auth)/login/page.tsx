import { redirect } from 'next/navigation';
import { AuthLayout, LoginForm } from '@/components/auth';
import { getAuthenticatedUser } from '@/lib/auth/session.server';

/**
 * Login Page
 *
 * Allows existing users to log in to their ClashCampus account.
 * Features a glass morphism card with email and password fields.
 * No backend logic implemented yet.
 */
export default async function LoginPage() {
  const { user } = await getAuthenticatedUser();
  if (user) {
    redirect('/profile');
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to check your rankings and defend your status."
    >
      <LoginForm />
    </AuthLayout>
  );
}
