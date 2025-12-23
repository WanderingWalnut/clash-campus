import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { TopBanner, Navigation } from '@/components/landing';
import { AuthProvider } from '@/components/providers';
import './globals.css';

/**
 * Plus Jakarta Sans - Primary font for ClashCampus
 * Modern, clean, and highly legible for UI elements
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
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
        className={`${plusJakartaSans.variable} font-sans antialiased bg-[#0D0D0D] text-white`}
      >
        <AuthProvider>
          <TopBanner />
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
