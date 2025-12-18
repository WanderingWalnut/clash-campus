import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

/**
 * Metadata for the auth error page.
 */
export const metadata: Metadata = {
    title: 'Authentication Error | ClashCampus',
    description: 'There was a problem verifying your account.',
};

/**
 * Auth Code Error Page
 * 
 * Displayed when OAuth callback or email confirmation fails.
 * Provides clear messaging and links to retry the authentication flow.
 */
export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen pt-32 pb-16 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-hero-glow z-0" />
            <div
                className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage:
                        'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                }}
            />

            <div className="relative z-10 max-w-md mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                        Authentication Error
                    </h1>
                    <p className="text-gray-400">
                        Something went wrong while verifying your account.
                    </p>
                </div>

                <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    <div className="space-y-4 text-gray-300">
                        <p>This could happen for a few reasons:</p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                            <li>The verification link has expired</li>
                            <li>The link was already used</li>
                            <li>The link was invalid or corrupted</li>
                            <li>There was a temporary server issue</li>
                        </ul>
                    </div>

                    <div className="mt-8 space-y-4">
                        <Link
                            href="/signup"
                            className="w-full bg-[#4717F6] hover:bg-[#350ec9] text-white px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(71,23,246,0.5)] hover:shadow-[0_0_30px_rgba(71,23,246,0.7)] flex items-center justify-center gap-2"
                        >
                            Try Signing Up Again
                        </Link>

                        <Link
                            href="/login"
                            className="w-full glass hover:bg-white/10 text-white px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            Back to Login
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-gray-500">
                    If this keeps happening, please contact support.
                </p>
            </div>
        </div>
    );
}

