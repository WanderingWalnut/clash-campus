import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { TopBanner, Navigation } from '@/components/landing';
import { AuthProvider } from '@/components/providers';
import './globals.css';

const clashFont = localFont({
  src: [
    {
      path: '../public/assets/fonts/Clash_Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/assets/fonts/Clash_Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
});

/**
 * Site-wide metadata for SEO and social sharing
 */
export const metadata: Metadata = {
  title: 'ClashCampus | Where Clash Becomes Culture',
  description:
    'A social status system for university Clash Royale players. Link your account, verify your campus, and compete for prestige on Royale Rankings.',
  keywords: [
    'Clash Royale',
    'university',
    'esports',
    'leaderboard',
    'gaming',
    'college',
    'competitive gaming',
  ],
  authors: [{ name: 'ClashCampus' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'ClashCampus | Where Clash Becomes Culture',
    description:
      'A social status system for university Clash Royale players. Compete for prestige on Royale Rankings.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ClashCampus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClashCampus | Where Clash Becomes Culture',
    description:
      'A social status system for university Clash Royale players. Compete for prestige on Royale Rankings.',
  },
};

/**
 * Root layout component that wraps all pages.
 * Provides the base HTML structure, fonts, global navigation, and styles.
 *
 * @param children - The page content to render (React.ReactNode)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${clashFont.className} antialiased bg-[#0F1B2E] text-white`}
      >
        <div
          className="fixed inset-0 bg-royale-pattern opacity-5 pointer-events-none z-0"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <AuthProvider>
            <TopBanner />
            <Navigation />
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
