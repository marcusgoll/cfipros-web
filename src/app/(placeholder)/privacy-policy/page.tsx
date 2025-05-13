import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | CFIPros',
  description: 'CFIPros privacy policy and data handling practices.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <div className="bg-muted p-6 rounded-lg mb-8 text-center">
        <p className="text-lg mb-2">This is a placeholder page for the Privacy Policy.</p>
        <p className="text-muted-foreground">More content will be added soon.</p>
      </div>

      <div className="prose max-w-none dark:prose-invert">
        <p>
          <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2>Introduction</h2>
        <p>
          This Privacy Policy outlines how CFIPros (&quot;we&quot;, &quot;our&quot;, or
          &quot;us&quot;) collects, uses, and protects your personal information when you use our
          website and services.
        </p>

        <h2>Information We Collect</h2>
        <p>This section would detail what information we collect from users, including:</p>
        <ul>
          <li>Personal identification information</li>
          <li>Usage data and analytics</li>
          <li>Information submitted through our platform</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>This section would explain how we use the collected information, including:</p>
        <ul>
          <li>Providing and improving our services</li>
          <li>Communication with users</li>
          <li>Analytics and performance monitoring</li>
        </ul>

        <h2>Data Protection</h2>
        <p>This section would outline our commitment to protecting your data, including:</p>
        <ul>
          <li>Security measures implemented</li>
          <li>Data retention policies</li>
          <li>Third-party service providers and their compliance</li>
        </ul>

        <h2>Your Rights</h2>
        <p>This section would detail your rights regarding your personal data, including:</p>
        <ul>
          <li>Access to your data</li>
          <li>Correction of inaccurate data</li>
          <li>Deletion of your data</li>
          <li>Opting out of communications</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at
          privacy@cfipros.com.
        </p>
      </div>
    </div>
  );
}
