'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { usePostHog } from 'posthog-js/react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  title: string;
  trackingId?: string;
  featureFlag?: string;
  requireAuth?: boolean;
  excludeWhenAuth?: boolean;
  isAuthenticated?: boolean;
  className?: string;
  variant?: 'topbar' | 'footer';
  exact?: boolean;
}

export function NavLink({
  href,
  title,
  trackingId,
  featureFlag,
  requireAuth = false,
  excludeWhenAuth = false,
  isAuthenticated = false,
  className,
  variant = 'topbar',
  exact = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const posthog = usePostHog();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  // Check feature flag if provided
  const { enabled: featureFlagEnabled } = useFeatureFlag(featureFlag);

  // If this link requires auth and user is not authenticated, don't show it
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If this link should be excluded when authenticated and user is authenticated, don't show it
  if (excludeWhenAuth && isAuthenticated) {
    return null;
  }

  // If this link has a feature flag and it's not enabled, don't show it
  if (featureFlag && !featureFlagEnabled) {
    return null;
  }

  const trackNavClick = () => {
    const trackId = trackingId || title.toLowerCase().replace(/\s+/g, '-');
    posthog?.capture(variant === 'topbar' ? 'landing_nav_clicked' : 'footer_link_clicked', {
      item: trackId,
    });
  };

  // Styles based on variant
  const topbarLinkStyles = cn(
    'text-sm transition-colors',
    isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
    className
  );

  const footerLinkStyles = cn(
    'text-sm transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
    className
  );

  const styles = variant === 'topbar' ? topbarLinkStyles : footerLinkStyles;

  return (
    <Link
      href={href}
      className={styles}
      onClick={trackNavClick}
      aria-current={isActive ? 'page' : undefined}
    >
      {title}
    </Link>
  );
}
