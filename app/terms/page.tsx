import type { Metadata } from 'next';
import { Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Terms of Service | ClashCampus',
  description: 'Terms of Service for ClashCampus - User responsibilities, account requirements, and service limitations.',
  openGraph: {
    title: 'Terms of Service | ClashCampus',
    description: 'Terms of Service for ClashCampus - User responsibilities, account requirements, and service limitations.',
  },
};

/**
 * Terms of Service Page
 *
 * Displays the terms of service covering user responsibilities, account requirements,
 * acceptable use, and service limitations.
 */
export default function TermsPage() {
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
                Terms of Service
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
                <h2 className="text-2xl font-bold text-white mb-4">
                  Acceptance of Terms
                </h2>
                <p>
                  By accessing or using ClashCampus ("the Service"), you agree to be
                  bound by these Terms of Service. If you do not agree to these terms,
                  please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Account Requirements
                </h2>
                <p>To use ClashCampus, you must:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    Provide a valid university email address for verification
                  </li>
                  <li>
                    Verify ownership of your Clash Royale account through our
                    verification process
                  </li>
                  <li>
                    Provide accurate and truthful information about your identity and
                    game account
                  </li>
                  <li>
                    Maintain the security of your account credentials
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  User Responsibilities
                </h2>
                <p>You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    Maintaining the accuracy of your account information
                  </li>
                  <li>
                    Keeping your account credentials secure and confidential
                  </li>
                  <li>
                    All activities that occur under your account
                  </li>
                  <li>
                    Complying with all applicable laws and regulations
                  </li>
                  <li>
                    Not using the Service for any illegal or unauthorized purpose
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Service Description
                </h2>
                <p>
                  ClashCampus is an unofficial fan-made platform that provides rankings
                  and leaderboards for university Clash Royale players. The Service
                  aggregates game data from the Clash Royale API and displays it in a
                  university-focused context.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Service Limitations
                </h2>
                <p>We do not guarantee:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    The accuracy, completeness, or timeliness of rankings data
                  </li>
                  <li>
                    Uninterrupted or error-free service availability
                  </li>
                  <li>
                    That the Service will meet your specific requirements
                  </li>
                  <li>
                    That any errors will be corrected
                  </li>
                </ul>
                <p className="mt-4">
                  Rankings are calculated based on available data and may not reflect
                  real-time game statistics.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Acceptable Use
                </h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    Attempt to gain unauthorized access to the Service or its systems
                  </li>
                  <li>
                    Use automated tools to scrape or extract data from the Service
                  </li>
                  <li>
                    Interfere with or disrupt the Service or servers
                  </li>
                  <li>
                    Impersonate another person or entity
                  </li>
                  <li>
                    Use the Service to violate any laws or regulations
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Intellectual Property
                </h2>
                <p>
                  Clash Royale and all related trademarks, logos, and content are the
                  property of Supercell. ClashCampus is not affiliated with, endorsed
                  by, or sponsored by Supercell.
                </p>
                <p className="mt-4">
                  The ClashCampus platform, including its design, code, and original
                  content, is the property of ClashCampus. You may not reproduce,
                  distribute, or create derivative works without permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Disclaimers</h2>
                <p>
                  <strong>Unofficial Service:</strong> ClashCampus is an unofficial,
                  fan-made service and is not endorsed by or affiliated with Supercell.
                </p>
                <p className="mt-4">
                  <strong>No Warranty:</strong> The Service is provided "as is" without
                  warranties of any kind, either express or implied.
                </p>
                <p className="mt-4">
                  <strong>Limitation of Liability:</strong> ClashCampus shall not be
                  liable for any indirect, incidental, special, or consequential damages
                  arising from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Account Termination
                </h2>
                <p>
                  We reserve the right to suspend or terminate your account at any time
                  for violation of these Terms of Service, fraudulent activity, or any
                  other reason we deem necessary.
                </p>
                <p className="mt-4">
                  You may delete your account at any time through your account settings.
                  Upon deletion, your data will be removed in accordance with our
                  Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Changes to Terms
                </h2>
                <p>
                  We may update these Terms of Service from time to time. We will notify
                  you of any changes by posting the new Terms of Service on this page
                  and updating the "Last updated" date. Your continued use of the
                  Service after such changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
                <p>
                  If you have questions about these Terms of Service, please contact us
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

