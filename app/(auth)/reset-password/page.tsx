import Link from 'next/link'
import { cookies } from 'next/headers'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { RECOVERY_COOKIE_NAME } from '@/lib/auth/recovery.server'
import { createClient } from '@/lib/supabase/server'

export default async function ResetPasswordPage() {
  const [supabase, cookieStore] = await Promise.all([createClient(), cookies()])
  const { data } = await supabase.auth.getUser()
  const hasRecoverySession =
    Boolean(data.user)
    && cookieStore.get(RECOVERY_COOKIE_NAME)?.value === data.user?.id

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use at least eight characters."
    >
      <div className="bg-[#1A2332] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {hasRecoverySession ? (
          <ResetPasswordForm />
        ) : (
          <div className="text-center">
            <p className="text-gray-300">
              This recovery link is invalid or expired.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-flex button-royale text-white px-6 py-3 rounded-lg font-bold"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
