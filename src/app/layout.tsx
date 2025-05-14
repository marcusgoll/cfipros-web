import './globals.css';
import type { Metadata } from 'next';
import { AnalyticsProvider } from '@/providers/AnalyticsProvider';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Inter } from 'next/font/google';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CFIPros - Advanced Flight Training Analytics',
  description: 'Helping flight instructors build successful pilots with data-driven insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PostHogProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider>
              <ThemeProvider>
                <div className="min-h-screen flex flex-col">
                  <TopBar />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
              </ThemeProvider>
            </AnalyticsProvider>
          </Suspense>
        </PostHogProvider>
      </body>
    </html>
  );
}
