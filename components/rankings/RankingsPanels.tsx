'use client';

import Link from 'next/link';

/**
 * Shared props for panel components (loading, error, empty states)
 */
interface PanelProps {
  message: string;
}

/**
 * Loading state panel - shown while fetching rankings data
 */
export function LoadingPanel({ message }: PanelProps) {
  return (
    <div className="bg-[#1B2637] border border-gray-800 rounded-xl p-8 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}

/**
 * Error state panel - shown when API requests fail
 */
export function ErrorPanel({ message }: PanelProps) {
  return (
    <div className="bg-[#1B2637] border border-red-900/40 rounded-xl p-8 text-center text-sm text-red-200">
      {message}
    </div>
  );
}

/**
 * Empty state panel - shown when no rankings data is available
 */
export function EmptyPanel({ message }: PanelProps) {
  return (
    <div className="bg-[#1B2637] border border-gray-800 rounded-xl p-8 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}

/**
 * Authentication prompt - shown when user tries to view player rankings
 * without being logged in. Includes a link to the login page.
 */
export function AuthPrompt() {
  return (
    <div className="bg-[#1B2637] border border-gray-800 rounded-xl p-8 text-center text-sm text-gray-400">
      <p className="mb-3">Sign in to see your university player rankings.</p>
      <Link
        href="/login"
        className="button-royale inline-flex items-center justify-center rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition-transform duration-300 hover:-translate-y-0.5"
      >
        Sign In
      </Link>
    </div>
  );
}
