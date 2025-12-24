import type { NextConfig } from "next";

/**
 * Baseline security headers applied to all routes.
 * These are "safe defaults" that reduce attack surface without breaking typical app behavior.
 * 
 * Note: We avoid strict CSP initially because it requires enumerating all allowed sources
 * (scripts, fonts, images, etc.) and can easily break UX if misconfigured.
 */
const securityHeaders = [
  {
    // Prevent MIME type sniffing (helps avoid some XSS vectors)
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Limit referrer data leakage to other sites
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Prevent clickjacking by blocking iframe embedding
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Disable browser features we don't use (camera, mic, geolocation, etc.)
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    // Enable DNS prefetching for performance
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.clashroyale.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
