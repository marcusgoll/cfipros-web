import './globals.css';
import type { Metadata } from 'next';
import { AnalyticsProvider } from '@/providers/AnalyticsProvider';
import { PostHogProvider } from '@/providers/PostHogProvider';

export const metadata: Metadata = {
  title: 'CFI PROS',
  description: 'The platform for flight instructors and students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}