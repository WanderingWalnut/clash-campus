import { redirect } from 'next/navigation'
import { AuthLayout } from '@/components/auth'

interface ConfirmEmailPageProps {
    searchParams: {
        token_hash?: string
        type?: string
        next?: string
    }
}

const DEFAULT_NEXT = '/rankings'

/**
 * Email confirmation landing page.
 *
 * This page renders a POST form so email scanners do not consume the token
 * before the user explicitly continues.
 */
export default function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
    const tokenHash = searchParams.token_hash
    const type = searchParams.type
    const nextPath = searchParams.next ?? DEFAULT_NEXT

    // Missing params means the link is invalid or already consumed.
    if (!tokenHash || !type) {
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
                    {/* Hidden fields preserve the token and redirect target. */}
                    <input type="hidden" name="token_hash" value={tokenHash} />
                    <input type="hidden" name="type" value={type} />
                    <input type="hidden" name="next" value={nextPath} />

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
