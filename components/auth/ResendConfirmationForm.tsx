'use client'

import { useEffect, useState } from 'react'
import { resendConfirmation } from '@/app/(auth)/resend-confirmation/action'

interface ResendConfirmationFormProps {
  initialEmail?: string
}

export function ResendConfirmationForm({
  initialEmail = '',
}: ResendConfirmationFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [cooldown, setCooldown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (cooldown === 0) return
    const timer = window.setInterval(
      () => setCooldown((seconds) => Math.max(0, seconds - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [cooldown])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (cooldown > 0) return

    setLoading(true)
    setError(null)
    setMessage(null)

    const result = await resendConfirmation(email)
    if ('error' in result) {
      setError(result.error)
    } else {
      setMessage(result.message ?? null)
      setCooldown(60)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="confirmation-email" className="sr-only">
        University email
      </label>
      <input
        id="confirmation-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
        placeholder="you@university.edu"
        className="w-full px-4 py-3 bg-[#0F1B2E] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#003DA5] focus:ring-1 focus:ring-[#003DA5]"
      />
      {error ? <p className="text-sm text-red-300" role="alert">{error}</p> : null}
      {message ? <p className="text-sm text-green-300" role="status">{message}</p> : null}
      <button
        type="submit"
        disabled={loading || cooldown > 0}
        className="button-royale w-full px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg"
      >
        {loading
          ? 'Sending...'
          : cooldown > 0
            ? `Resend in ${cooldown}s`
            : 'Resend confirmation email'}
      </button>
    </form>
  )
}
