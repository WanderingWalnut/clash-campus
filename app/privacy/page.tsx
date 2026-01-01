import type { Metadata } from 'next';
import { Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Privacy Policy | ClashCampus',
  description: 'Privacy Policy for ClashCampus - Learn how we collect, use, and protect your data.',
  openGraph: {
    title: 'Privacy Policy | ClashCampus',
    description: 'Privacy Policy for ClashCampus - Learn how we collect, use, and protect your data.',
  },
};

/**
 * Privacy Policy Page
 *
 * Displays the privacy policy covering data collection, usage, security, and user rights.
 */
export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F1B2E] pt-28">
      <div className="flex-1">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-glow opacity-20" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-10">
              <span className="text-xs uppercase tracking-widest text-[#FFD700] font-bold">
                Legal
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-3">
                Privacy Policy
              </h1>
              <p className="text-gray-400 mt-3">
                Last updated: {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
                <p>
                  ClashCampus (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use, and
                  safeguard your information when you use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Data Collection</h2>
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    <strong>University Email Address:</strong> Required for account
                    creation and university verification
                  </li>
                  <li>
                    <strong>Clash Royale Account Information:</strong> Player tag,
                    trophies, league information, and game statistics obtained through
                    the Clash Royale API
                  </li>
                  <li>
                    <strong>Profile Data:</strong> Information you provide when
                    creating your profile
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Data Usage</h2>
                <p>We use your data for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Displaying your rankings on campus leaderboards</li>
                  <li>Calculating university rankings and scores</li>
                  <li>Matching you to your verified university</li>
                  <li>Providing you with your profile and statistics</li>
                  <li>Improving our service and user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
                <p>
                  We use Supabase for secure data storage and authentication. Your data
                  is protected through:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Encrypted data transmission (HTTPS)</li>
                  <li>Secure database infrastructure</li>
                  <li>Row-level security policies</li>
                  <li>Authentication and authorization controls</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">User Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Access your personal data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Update or correct your information</li>
                  <li>Opt out of certain data processing activities</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us through your account
                  settings or by deleting your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
                <p>
                  We use the following third-party services that may collect information:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    <strong>Supabase:</strong> Database and authentication services
                  </li>
                  <li>
                    <strong>Clash Royale API:</strong> Game data and statistics
                  </li>
                </ul>
                <p className="mt-4">
                  These services have their own privacy policies governing the use of
                  your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify
                  you of any changes by posting the new Privacy Policy on this page and
                  updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us
                  through your account settings or by managing your account preferences.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
