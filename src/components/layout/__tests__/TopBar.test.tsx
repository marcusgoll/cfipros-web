import React from 'react';
import { waitFor } from '@testing-library/react';
import { render, screen } from './test-utils';
import { TopBar } from '../TopBar';
import { usePathname } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Mock the hooks and libraries
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: jest.fn(),
}));

jest.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));

jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

// Set up the test environment for React 18
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('TopBar Component', () => {
  // Mock setup
  const captureMock = jest.fn();
  const mockGetSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (usePathname as jest.Mock).mockReturnValue('/');
    (usePostHog as jest.Mock).mockReturnValue({ capture: captureMock });
    (useFeatureFlag as jest.Mock).mockReturnValue({ enabled: true, loading: false });
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: mockGetSession,
      },
    });
  });

  test('renders logo and navigation links when enhanced nav is enabled', async () => {
    // Mock unauthenticated session
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(<TopBar />);

    // Logo should be visible
    expect(screen.getByText('CFIPros')).toBeInTheDocument();

    // Navigation links should be visible with enhanced nav enabled
    await waitFor(() => {
      expect(screen.getByText('Why CFIPros?')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('Docs')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
    });
  });

  test('hides company link when its feature flag is disabled', async () => {
    // Mock a specific feature flag check for the company link
    const originalUseFeatureFlag = useFeatureFlag as jest.Mock;
    originalUseFeatureFlag.mockImplementation((flagName) => {
      if (flagName === 'nav-company-link-enabled') {
        return { enabled: false, loading: false };
      }
      return { enabled: true, loading: false };
    });

    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(<TopBar />);

    // Company link should not be visible
    await waitFor(() => {
      expect(screen.queryByText('Company')).not.toBeInTheDocument();
    });
  });

  test('renders "Get Started" button when not authenticated', async () => {
    // Mock unauthenticated session
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(<TopBar />);

    await waitFor(() => {
      const getStartedButton = screen.getByRole('link', { name: 'Get Started' });
      expect(getStartedButton).toBeInTheDocument();
      expect(getStartedButton).toHaveAttribute('href', '/sign-up');
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  test('renders "Dashboard" button when authenticated', async () => {
    // Mock authenticated session
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
      },
    });

    render(<TopBar />);

    await waitFor(() => {
      const dashboardButton = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardButton).toBeInTheDocument();
      expect(dashboardButton).toHaveAttribute('href', '/dashboard');
      expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    });
  });

  test('hides all navigation links when enhanced nav is disabled', async () => {
    // Mock enhanced navigation disabled
    (useFeatureFlag as jest.Mock).mockReturnValue({ enabled: false, loading: false });
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(<TopBar />);

    // Navigation links should not be visible
    await waitFor(() => {
      expect(screen.queryByText('Why CFIPros?')).not.toBeInTheDocument();
      expect(screen.queryByText('Products')).not.toBeInTheDocument();
      expect(screen.queryByText('Pricing')).not.toBeInTheDocument();
      expect(screen.queryByText('Docs')).not.toBeInTheDocument();
      expect(screen.queryByText('Community')).not.toBeInTheDocument();
      expect(screen.queryByText('Company')).not.toBeInTheDocument();
    });
  });
});
