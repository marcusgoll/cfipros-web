'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { usePostHog } from 'posthog-js/react';
import { useFeatureFlag } from '@/lib/feature-flags/client';
import { type FeatureFlag } from '@/lib/feature-flags';
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
  onClick?: () => void;
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
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const posthog = usePostHog();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  // Call useFeatureFlag unconditionally at the top level
  const isFlagEnabled = useFeatureFlag(featureFlag as FeatureFlag);
  // Check feature flag if provided
  const featureFlagEnabled = featureFlag ? isFlagEnabled : true;

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

  const handleInternalClick = () => {
    trackNavClick();
    if (onClick) {
      onClick();
    }
  };

  // Styles based on variant
  const topbarLinkStyles = cn(
    'text-sm transition-colors',
    isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary',
    className
  );

  const footerLinkStyles = cn(
    'text-sm transition-colors',
    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary',
    className
  );

  const styles = variant === 'topbar' ? topbarLinkStyles : footerLinkStyles;

  return (
    <Link
      href={href}
      className={styles}
      onClick={handleInternalClick}
      aria-current={isActive ? 'page' : undefined}
    >
      {title}
    </Link>
  );
}
