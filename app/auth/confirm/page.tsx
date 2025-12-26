import { redirect } from 'next/navigation'
import { AuthLayout } from '@/components/auth'

interface ConfirmEmailPageProps {
    searchParams: {
        confirmation_url?: string
    }
}

// Always render on-demand so search params are respected in production.
export const dynamic = 'force-dynamic'

/**
 * Email confirmation landing page.
 *
 * This page renders a POST form so email scanners do not consume the actual
 * confirmation link before the user explicitly continues.
 *
 * The confirmation URL from Supabase already contains the correct redirect_to
 * parameter set during signup, so we use it as-is without modification.
 */
export default function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
    const confirmationUrl = searchParams.confirmation_url

    // Missing confirmation URL means the link is invalid or already consumed.
    if (!confirmationUrl) {
        redirect('/auth/auth-code-error')
    }

    return (
        <AuthLayout
            title="Confirm your email"
            subtitle="Click continue to finish setting up your account."
        >
            <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <p className="text-gray-300 text-sm sm:text-base mb-6">
                    For security, we only verify your email when you press the button below.
                </p>

                <form method="post" action="/auth/confirm/verify" className="space-y-4">
                    {/* Hidden field carries the confirmation URL to the POST handler.
                        The URL already contains the correct redirect_to parameter from Supabase. */}
                    <input type="hidden" name="confirmation_url" value={confirmationUrl} />

                    <button
                        type="submit"
                        className="w-full bg-[#4717F6] hover:bg-[#350ec9] text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(71,23,246,0.5)] hover:shadow-[0_0_30px_rgba(71,23,246,0.7)]"
                    >
                        Continue
                    </button>
                </form>

                <p className="mt-6 text-xs text-gray-500">
                    If this link was opened by your email provider, just click continue to finish.
                </p>
            </div>
        </AuthLayout>
    )
}
