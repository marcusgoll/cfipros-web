import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './test-utils';
import { NavLink } from '../NavLink';
import { usePathname } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

// Mock the hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: jest.fn(),
}));

jest.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));

// Set up the test environment for React 18
// This helps prevent "Objects are not valid as a React child" errors in tests
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('NavLink Component', () => {
  // Mock the posthog capture method
  const captureMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (usePathname as jest.Mock).mockReturnValue('/test');
    (usePostHog as jest.Mock).mockReturnValue({ capture: captureMock });
    (useFeatureFlag as jest.Mock).mockReturnValue({ enabled: true, loading: false });
  });

  test('renders correctly with basic props', () => {
    render(<NavLink href="/test" title="Test Link" />);

    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('applies active styles when current path matches href', () => {
    render(<NavLink href="/test" title="Test Link" />);

    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toHaveClass('text-foreground');
    expect(link).not.toHaveClass('text-muted-foreground');
  });

  test('applies inactive styles when current path does not match href', () => {
    (usePathname as jest.Mock).mockReturnValue('/other');

    render(<NavLink href="/test" title="Test Link" />);

    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).not.toHaveClass('text-foreground');
    expect(link).toHaveClass('text-muted-foreground');
  });

  test('tracks click events with PostHog', async () => {
    const user = userEvent.setup();

    render(<NavLink href="/test" title="Test Link" />);

    const link = screen.getByRole('link', { name: 'Test Link' });
    await user.click(link);

    expect(captureMock).toHaveBeenCalledWith('landing_nav_clicked', {
      item: 'test-link',
    });
  });

  test('uses trackingId if provided', async () => {
    const user = userEvent.setup();

    render(<NavLink href="/test" title="Test Link" trackingId="custom-id" />);

    const link = screen.getByRole('link', { name: 'Test Link' });
    await user.click(link);

    expect(captureMock).toHaveBeenCalledWith('landing_nav_clicked', {
      item: 'custom-id',
    });
  });

  test('does not render if feature flag is disabled', () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({ enabled: false, loading: false });

    render(<NavLink href="/test" title="Test Link" featureFlag="test-flag" />);

    const link = screen.queryByRole('link', { name: 'Test Link' });
    expect(link).not.toBeInTheDocument();
  });

  test('does not render if requireAuth is true but user is not authenticated', () => {
    render(<NavLink href="/test" title="Test Link" requireAuth={true} isAuthenticated={false} />);

    const link = screen.queryByRole('link', { name: 'Test Link' });
    expect(link).not.toBeInTheDocument();
  });

  test('does not render if excludeWhenAuth is true and user is authenticated', () => {
    render(
      <NavLink href="/test" title="Test Link" excludeWhenAuth={true} isAuthenticated={true} />
    );

    const link = screen.queryByRole('link', { name: 'Test Link' });
    expect(link).not.toBeInTheDocument();
  });

  test('uses footer variant styles when specified', () => {
    render(<NavLink href="/test" title="Test Link" variant="footer" />);

    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toBeInTheDocument();

    // Footer tracking should be different
    userEvent.click(link);
    expect(captureMock).toHaveBeenCalledWith('footer_link_clicked', expect.any(Object));
  });
});
