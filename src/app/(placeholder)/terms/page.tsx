import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | CFIPros',
  description: 'CFIPros terms of service and user agreement.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Terms of Service.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="prose max-w-none dark:prose-invert">
        <p>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the CFIPros platform, you agree to be bound by these Terms of
          Service and all applicable laws and regulations. If you do not agree with any of these
          terms, you are prohibited from using or accessing this site.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily access the materials on CFIPros&apos;s website for
          personal, non-commercial transitory viewing only. This is the grant of a license, not a
          transfer of title.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate and complete information.
          You are responsible for maintaining the security of your account and password.
        </p>

        <h2>4. Limitation of Liability</h2>
        <p>
          CFIPros shall not be liable for any indirect, incidental, special, consequential or
          punitive damages resulting from your access to or use of, or inability to access or use,
          the service or any content provided on the service.
        </p>

        <h2>5. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws applicable in the
          jurisdiction where CFIPros operates, without regard to its conflict of law provisions.
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          CFIPros reserves the right, at our sole discretion, to modify or replace these Terms at
          any time. It is your responsibility to check our Terms periodically for changes.
        </p>

        <h2>7. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at legal@cfipros.com.</p>
      </div>
    </div>
  );
}
