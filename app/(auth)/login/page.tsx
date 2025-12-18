import { AuthLayout, LoginForm } from '@/components/auth';

/**
 * Login Page
 *
 * Allows existing users to log in to their ClashCampus account.
 * Features a glass morphism card with email and password fields.
 * No backend logic implemented yet.
 */
export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to check your rankings and defend your status."
    >
      <LoginForm />
    </AuthLayout>
  );
}
