import { Crown } from 'lucide-react';

/** Footer navigation links */
const FOOTER_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

/**
 * Site footer with logo, navigation links, and legal disclaimer.
 * Server component - no client-side interactivity required.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A1628] py-6 md:py-12 border-t border-[#1A2332]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        {/* Logo */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <Crown className="text-slate-500 w-5 h-5 md:w-6 md:h-6" />
          <span className="font-bold text-sm md:text-base text-slate-400 tracking-tight">
            CLASH<span className="text-slate-500">CAMPUS</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-4 md:gap-8 text-xs md:text-sm text-slate-500">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Legal Disclaimer */}
        <div className="text-[10px] md:text-xs text-slate-600 text-center md:text-left">
          <div>© {currentYear} ClashCampus. Not affiliated with Supercell.</div>
          <div className="mt-0.5 md:mt-1">
            This material is unofficial and is not endorsed by Supercell. For
            more information, see{' '}
            <a
              href="https://supercell.com/en/fan-content-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-500"
            >
              Supercell's Fan Content Policy
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  );
}
