'use client';

import Link from 'next/link';
import { usePostHog } from 'posthog-js/react';
import { Shield, Github, Award } from 'lucide-react';
import { NavLink } from './NavLink';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { FeatureFlag } from '@/lib/feature-flags';

// Define the footer links for each category
interface FooterLink {
  name: string;
  href: string;
  featureFlag?: FeatureFlag;
}

interface FooterCategory {
  id: string;
  title: string;
  links: FooterLink[];
}

const footerLinks: FooterCategory[] = [
  {
    id: 'product',
    title: 'Product',
    links: [
      { name: 'Why CFIPros?', href: '/why' },
      { name: 'Features', href: '/products' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Roadmap', href: '/docs' },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Guides', href: '/docs' },
      { name: 'Support', href: '/community' },
      { name: 'Community', href: '/community' },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact', href: '/contact' },
      { name: 'Company', href: '/company', featureFlag: 'COMPANY_LINK_ENABLED' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { name: 'Terms', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
];

// Trust badges
const trustBadges = [
  {
    id: 'open-source',
    name: 'Open Source',
    icon: <Github className="h-5 w-5" />,
    description: 'Parts of our platform are open source and community-driven.',
  },
  {
    id: 'soc2',
    name: 'SOC-2 Compliant',
    icon: <Shield className="h-5 w-5" />,
    description: 'We follow strict security and privacy standards.',
  },
  {
    id: 'faa',
    name: 'FAA-Compliant',
    icon: <Award className="h-5 w-5" />,
    description: 'Our tools align with FAA regulatory requirements.',
  },
];

export function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const posthog = usePostHog();
  const { enabled: enhancedNavEnabled } = useFeatureFlag('enhanced-nav-enabled', true);

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

  const trackFooterLinkClick = (category: string, linkName: string) => {
    posthog?.capture('landing_footer_link_clicked', {
      category,
      link_name: linkName,
    });
  };

  return (
    <footer className="border-t border-border">
      <div className="container px-4 md:px-6 mx-auto py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Logo and description */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative h-8 w-8">
                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                    CP
                  </div>
                </div>
                <span className="text-lg font-bold">CFIPros</span>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Advanced analytics and training tools to help flight instructors build successful
              pilots.
            </p>

            {/* Social links */}
            <div className="flex gap-4">
              {['twitter', 'linkedin', 'facebook', 'youtube'].map((social) => (
                <Link
                  key={social}
                  href={`https://${social}.com/cfipros`}
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  onClick={() => trackFooterLinkClick('social', social)}
                  aria-label={`Visit our ${social} page`}
                >
                  <span className="sr-only">{social}</span>
                  <span className="text-xs uppercase">{social.charAt(0)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sitemap columns */}
          {enhancedNavEnabled &&
            footerLinks.map((category) => (
              <div key={category.id} className="col-span-1">
                <h3 className="font-bold mb-4">{category.title}</h3>
                <ul className="space-y-3">
                  {category.links.map((link) => (
                    <li key={link.name}>
                      <NavLink
                        href={link.href}
                        title={link.name}
                        featureFlag={link.featureFlag}
                        variant="footer"
                        isAuthenticated={isAuthenticated}
                        trackingId={`${category.id}-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Trust badges */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {trustBadges.map((badge) => (
              <div key={badge.id} className="flex items-start gap-3">
                <div className="bg-muted/50 p-2 rounded-full">{badge.icon}</div>
                <div>
                  <h4 className="font-medium">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright and legal links */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-border pt-6">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} CFIPros. All rights reserved.
          </p>
          <div className="flex gap-6">
            <NavLink
              href="/privacy-policy"
              title="Privacy Policy"
              variant="footer"
              isAuthenticated={isAuthenticated}
            />
            <NavLink
              href="/terms"
              title="Terms of Service"
              variant="footer"
              isAuthenticated={isAuthenticated}
            />
            <NavLink href="/faq" title="FAQ" variant="footer" isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>
    </footer>
  );
}
