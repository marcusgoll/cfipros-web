'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../features/landing/ThemeToggle';
import { usePostHog } from 'posthog-js/react';
import { NavLink } from './NavLink';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useFeatureFlag } from '@/lib/feature-flags/client';
import type { FeatureFlag } from '@/lib/feature-flags';

// Navigation links with optional feature flags
interface NavLinkItem {
  title: string;
  href: string;
  featureFlag?: FeatureFlag;
}

const NAV_LINKS: NavLinkItem[] = [
  { title: 'Why CFIPros?', href: '/why' },
  { title: 'Products', href: '/products' },
  { title: 'Pricing', href: '/pricing' },
  { title: 'Docs', href: '/docs' },
  { title: 'Community', href: '/community' },
  { title: 'Company', href: '/company', featureFlag: 'COMPANY_LINK_ENABLED' },
];

export function TopBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const posthog = usePostHog();

  // Check for enhanced navigation feature flag
  const enhancedNavEnabled = useFeatureFlag('ENHANCED_NAV_ENABLED');

  useEffect(() => {
    const checkAuthState = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuthState();
  }, []);

  const trackNavClick = (item: string) => {
    posthog?.capture('landing_nav_clicked', {
      item,
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                CP
              </div>
            </div>
            <span className="text-lg font-bold">CFIPros</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {enhancedNavEnabled && (
          <nav className="hidden md:flex gap-6 items-center">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                title={link.title}
                featureFlag={link.featureFlag}
              />
            ))}
          </nav>
        )}

        {/* Actions section */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Conditional button based on auth state */}
          {isAuthenticated ? (
            <Link href="/dashboard" onClick={() => trackNavClick('dashboard')}>
              <Button variant="outline" className="hidden md:inline-flex border-primary">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/sign-up" onClick={() => trackNavClick('get-started')}>
              <Button variant="outline" className="hidden md:inline-flex border-primary">
                Get Started
              </Button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {enhancedNavEnabled &&
              NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  title={link.title}
                  featureFlag={link.featureFlag}
                  isAuthenticated={isAuthenticated}
                  className="py-2"
                />
              ))}

            {/* Conditional button based on auth state for mobile */}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => {
                  trackNavClick('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="mt-2"
              >
                <Button variant="outline" className="w-full border-primary">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link
                href="/sign-up"
                onClick={() => {
                  trackNavClick('get-started');
                  setMobileMenuOpen(false);
                }}
                className="mt-2"
              >
                <Button variant="outline" className="w-full border-primary">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
