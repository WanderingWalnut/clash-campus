import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ResendConfirmationForm } from '@/components/auth/ResendConfirmationForm'

export default function ResendConfirmationPage() {
  return (
    <AuthLayout
      title="Resend confirmation"
      subtitle="Request a new link for your university email."
    >
      <div className="bg-[#1A2332] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <ResendConfirmationForm />
        <Link
          href="/login"
          className="mt-6 block text-center text-sm text-[#FFD700] hover:underline"
        >
          Back to login
        </Link>
      </div>
    </AuthLayout>
  )
}
