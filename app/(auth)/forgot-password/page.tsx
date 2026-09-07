import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { requestPasswordReset } from './action'

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string | string[]
    sent?: string | string[]
  }>
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams
  const error = Array.isArray(params.error) ? params.error[0] : params.error
  const sent = (Array.isArray(params.sent) ? params.sent[0] : params.sent) === '1'

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will send a secure recovery link to your email."
    >
      <div className="bg-[#1A2332] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {sent ? (
          <p className="mb-5 text-sm text-green-300" role="status">
            If an account exists for that email, a password reset link is on its way.
          </p>
        ) : null}
        {error === 'invalid-email' ? (
          <p className="mb-5 text-sm text-red-300" role="alert">
            Enter a valid email address.
          </p>
        ) : null}
        <form action={requestPasswordReset} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-[#0F1B2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#003DA5] focus:ring-1 focus:ring-[#003DA5]"
              placeholder="you@university.edu"
            />
          </div>
          <button type="submit" className="button-royale w-full text-white px-6 py-4 rounded-lg font-bold">
            Send recovery link
          </button>
        </form>
        <Link href="/login" className="mt-6 block text-center text-sm text-[#FFD700] hover:underline">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  )
}
