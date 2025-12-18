import { AuthLayout, SignUpForm } from '@/components/auth';

/**
 * Sign Up Page
 *
 * Allows new users to create an account on ClashCampus.
 * Features a glass morphism card with form fields for university email,
 * password, and confirm password. No backend logic implemented yet.
 */
export default function SignUpPage() {
  return (
    <AuthLayout
      title="Join the Arena"
      subtitle="Create your account and claim your rank on campus."
    >
      <SignUpForm />
    </AuthLayout>
  );
}
