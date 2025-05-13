import './globals.css';
import type { Metadata } from 'next';
import { AnalyticsProvider } from '@/providers/AnalyticsProvider';
import { PostHogProvider } from '@/providers/PostHogProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CFIPros - Advanced Flight Training Analytics",
  description: "Helping flight instructors build successful pilots with data-driven insights",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PostHogProvider>
          <AnalyticsProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AnalyticsProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}