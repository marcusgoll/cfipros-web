import { screen, fireEvent, act } from '@testing-library/react';
import { NavLink } from '../NavLink';
import { customRender as render } from './test-utils';
import { usePathname } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';
import { useFeatureFlag } from '@/lib/feature-flags/client';

// Mock the hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: jest.fn(),
}));

jest.mock('@/lib/feature-flags/client', () => ({
  useFeatureFlag: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  interface MockLinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
    'aria-current'?: 'page' | undefined;
  }
  // Assign to a const, set displayName, then return the const
  const MockedLink = ({
    children,
    href,
    className,
    onClick,
    'aria-current': ariaCurrent,
  }: MockLinkProps) => {
    return (
      <a href={href} className={className} onClick={onClick} aria-current={ariaCurrent}>
        {children}
      </a>
    );
  };
  MockedLink.displayName = 'MockNextLink';
  return MockedLink;
});

// Set up the test environment for React 18
// This helps prevent "Objects are not valid as a React child" errors in tests
// @ts-expect-error - IS_REACT_ACT_ENVIRONMENT is added at runtime
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('NavLink Component', () => {
  const mockCapture = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/current-path');
    (usePostHog as jest.Mock).mockReturnValue({ capture: mockCapture });
    (useFeatureFlag as jest.Mock).mockReturnValue(true);
  });

  test('renders correctly with basic props', async () => {
    await act(async () => {
      render(<NavLink href="/test-link" title="Test Link" />);
    });
    expect(screen.getByRole('link', { name: 'Test Link' })).toBeInTheDocument();
  });

  test('applies active styles when current path matches href', async () => {
    (usePathname as jest.Mock).mockReturnValue('/active-link');
    await act(async () => {
      render(<NavLink href="/active-link" title="Active Link" />);
    });
    const linkElement = screen.getByRole('link', { name: 'Active Link' });
    expect(linkElement).toHaveClass('text-primary');
    expect(linkElement).toHaveClass('font-medium');
    expect(linkElement).not.toHaveClass('text-muted-foreground');
  });

  test('applies inactive styles when current path does not match href', async () => {
    (usePathname as jest.Mock).mockReturnValue('/current-path');
    await act(async () => {
      render(<NavLink href="/other-link" title="Inactive Link" />);
    });
    const linkElement = screen.getByRole('link', { name: 'Inactive Link' });
    expect(linkElement).toHaveClass('text-muted-foreground');
    expect(linkElement).toHaveClass('hover:text-primary');
  });

  test('tracks click events with PostHog', async () => {
    await act(async () => {
      render(<NavLink href="/track-link" title="Track Link" />);
    });
    const linkElement = screen.getByRole('link', { name: 'Track Link' });
    await act(async () => {
      fireEvent.click(linkElement);
    });
    expect(mockCapture).toHaveBeenCalledWith('landing_nav_clicked', { item: 'track-link' });
  });

  test('uses trackingId if provided', async () => {
    await act(async () => {
      render(<NavLink href="/custom-track" title="Custom Track" trackingId="custom_nav_click" />);
    });
    const linkElement = screen.getByRole('link', { name: 'Custom Track' });
    await act(async () => {
      fireEvent.click(linkElement);
    });
    expect(mockCapture).toHaveBeenCalledWith('landing_nav_clicked', { item: 'custom_nav_click' });
  });

  test('does not render if feature flag is disabled', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue(false);

    await act(async () => {
      // @ts-expect-error - Using a test value that doesn't match the FeatureFlag type for testing
      render(<NavLink href="/test" title="Test Link" featureFlag="test-flag" />);
    });

    const link = screen.queryByRole('link', { name: 'Test Link' });
    expect(link).not.toBeInTheDocument();
  });

  test('does not render if requireAuth is true but user is not authenticated', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue(true);
    await act(async () => {
      render(<NavLink href="/test" title="Test Link" requireAuth={true} isAuthenticated={false} />);
    });

    const link = screen.queryByRole('link', { name: 'Test Link' });
    expect(link).not.toBeInTheDocument();
  });

  test('does not render if excludeWhenAuth is true and user is authenticated', async () => {
    (useFeatureFlag as jest.Mock).mockReturnValue(true);
    await act(async () => {
      render(
        <NavLink href="/test" title="Test Link" excludeWhenAuth={true} isAuthenticated={true} />
      );
    });

    const link = screen.queryByRole('link', { name: 'Test Link' });
    expect(link).not.toBeInTheDocument();
  });

  test('uses footer variant styles when specified (inactive)', async () => {
    (usePathname as jest.Mock).mockReturnValue('/current-path');
    await act(async () => {
      render(<NavLink href="/footer-link" title="Footer Link" variant="footer" />);
    });
    const linkElement = screen.getByRole('link', { name: 'Footer Link' });
    expect(linkElement).toHaveClass('text-sm');
    expect(linkElement).toHaveClass('text-muted-foreground');
    expect(linkElement).toHaveClass('hover:text-primary');
    await act(async () => {
      fireEvent.click(linkElement);
    });
    expect(mockCapture).toHaveBeenCalledWith('footer_link_clicked', { item: 'footer-link' });
  });

  test('handles click events correctly', async () => {
    const handleClick = jest.fn();
    await act(async () => {
      render(<NavLink href="/click-test" title="Click Test" onClick={handleClick} />);
    });
    const linkElement = screen.getByText('Click Test');
    await act(async () => {
      fireEvent.click(linkElement);
    });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
