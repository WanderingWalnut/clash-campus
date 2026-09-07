'use client'

import { useState } from 'react'
import { resetPassword } from '@/app/(auth)/reset-password/action'

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const result = await resetPassword(new FormData(event.currentTarget))
    if ('error' in result) setError(result.error)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <p className="text-sm text-red-300" role="alert">{error}</p> : null}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-4 py-3 bg-[#0F1B2E] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#003DA5] focus:ring-1 focus:ring-[#003DA5]"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-4 py-3 bg-[#0F1B2E] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#003DA5] focus:ring-1 focus:ring-[#003DA5]"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="button-royale w-full disabled:opacity-50 text-white px-6 py-4 rounded-lg font-bold"
      >
        {loading ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}
