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
    <footer className="bg-black py-12 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Crown className="text-gray-600" size={24} />
          <span className="font-bold text-gray-500 tracking-tight">
            CLASH<span className="text-gray-700">CAMPUS</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-8 text-sm text-gray-500">
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
        <div className="text-xs text-gray-700 text-center md:text-left">
          <div>© {currentYear} ClashCampus. Not affiliated with Supercell.</div>
          <div className="mt-1">
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

