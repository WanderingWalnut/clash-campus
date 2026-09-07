import { redirect } from 'next/navigation'
import { AuthLayout } from '@/components/auth'

type ConfirmEmailSearchParams = {
    token_hash?: string
    type?: string
}

interface ConfirmEmailPageProps {
    searchParams: ConfirmEmailSearchParams | Promise<ConfirmEmailSearchParams>
}

// Always render on-demand so search params are respected in production.
export const dynamic = 'force-dynamic'

/**
 * Email confirmation landing page.
 *
 * This page renders a POST form so email scanners do not consume the actual
 * confirmation link before the user explicitly continues.
 *
 * The token hash is only verified after the user clicks the button to avoid
 * email scanners consuming the token.
 */
export default async function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
    const resolvedSearchParams = await searchParams
    const tokenHash = resolvedSearchParams.token_hash
    const otpType = resolvedSearchParams.type

    // Missing params means the link is invalid or already consumed.
    if (!tokenHash || !otpType) {
        redirect(
            otpType === 'recovery'
                ? '/auth/auth-code-error?flow=recovery'
                : '/auth/auth-code-error'
        )
    }

    return (
        <AuthLayout
            title="Confirm your email"
            subtitle="Click continue to finish setting up your account."
        >
            <div className="bg-[#1A2332] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <p className="text-gray-300 text-sm sm:text-base mb-6">
                    For security, we only verify your email when you press the button below.
                </p>

                <form method="post" action="/auth/confirm/verify" className="space-y-4">
                    <input type="hidden" name="token_hash" value={tokenHash} />
                    <input type="hidden" name="type" value={otpType} />

                    <button
                        type="submit"
                        className="button-royale w-full text-white px-6 py-4 rounded-lg font-bold text-lg transition-transform duration-300 hover:-translate-y-0.5"
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
