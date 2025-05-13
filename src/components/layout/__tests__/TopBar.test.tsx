import { screen, act, waitFor } from '@testing-library/react';
import { TopBar } from '../TopBar';
import { customRender as render } from './test-utils';
// Explicitly mock this aliased module as it was causing issues, though useAuth is not directly used by TopBar
jest.mock('@/lib/feature-flags/client', () => ({
  useFeatureFlag: jest.fn(),
}));

// import { useAuth } from '@/hooks/useAuth'; // REMOVED - TopBar does not use this
import { useFeatureFlag } from '@/lib/feature-flags/client'; // Import after mock. Adjusted to useFeatureFlag (singular)
import { useRouter, usePathname } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Import this to mock it

// Mock the hooks and libraries
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: jest.fn(),
}));

jest.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockNextLink';
  return MockLink;
});

// Set up the test environment for React 18
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('TopBar Component', () => {
  let mockGetSession: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock for createSupabaseBrowserClient and getSession
    mockGetSession = jest.fn();
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: mockGetSession,
      },
    });

    // Default to unauthenticated user
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    // Reset feature flags mock for each test
    (useFeatureFlag as jest.Mock).mockImplementation((flag: string) => {
      if (flag === 'enhanced-nav-enabled') return true;
      if (flag === 'company-link') return true;
      // Add other flags used by NavLink if necessary for specific tests
      if (flag === 'why-cfipros-link') return true;
      if (flag === 'products-link') return true;
      if (flag === 'pricing-link') return true;
      if (flag === 'docs-link') return true;
      if (flag === 'community-link') return true;
      return false; // Default other flags to false
    });

    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (usePathname as jest.Mock).mockReturnValue('/'); // Default pathname
  });

  it('renders logo and navigation links when enhanced nav is enabled', async () => {
    // mockGetSession is already set to unauthenticated in beforeEach
    await act(async () => {
      render(<TopBar />);
    });

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

  it('hides company link when its feature flag is disabled', async () => {
    (useFeatureFlag as jest.Mock).mockImplementation((flag: string) => {
      if (flag === 'enhanced-nav-enabled') return true;
      if (flag === 'company-link') return false; // Specifically disable company-link
      if (flag === 'why-cfipros-link') return true;
      if (flag === 'products-link') return true;
      if (flag === 'pricing-link') return true;
      if (flag === 'docs-link') return true;
      if (flag === 'community-link') return true;
      return false;
    });
    await act(async () => {
      render(<TopBar />);
    });

    // Company link should not be visible
    await waitFor(() => {
      expect(screen.queryByText('Company')).not.toBeInTheDocument();
    });
  });

  it('renders "Get Started" button when not authenticated', async () => {
    // mockGetSession is already set to unauthenticated in beforeEach
    await act(async () => {
      render(<TopBar />);
    });

    await waitFor(() => {
      const getStartedButton = screen.getByRole('link', { name: 'Get Started' });
      expect(getStartedButton).toBeInTheDocument();
      expect(getStartedButton).toHaveAttribute('href', '/sign-up');
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  it('renders "Dashboard" button when authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } }, error: null });
    await act(async () => {
      render(<TopBar />);
    });

    await waitFor(() => {
      const dashboardButton = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardButton).toBeInTheDocument();
      expect(dashboardButton).toHaveAttribute('href', '/dashboard');
      expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    });
  });

  it('hides all navigation links when enhanced nav is disabled', async () => {
    (useFeatureFlag as jest.Mock).mockImplementation((flag: string) => {
      if (flag === 'enhanced-nav-enabled') return false; // Specifically disable enhanced-nav
      // Other flags don't matter if enhanced-nav is false, but good to be explicit
      if (flag === 'company-link') return false;
      if (flag === 'why-cfipros-link') return false;
      if (flag === 'products-link') return false;
      if (flag === 'pricing-link') return false;
      if (flag === 'docs-link') return false;
      if (flag === 'community-link') return false;
      return false;
    });
    await act(async () => {
      render(<TopBar />);
    });

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

  // Add more tests for other scenarios like different roles, mobile view, etc.
});
