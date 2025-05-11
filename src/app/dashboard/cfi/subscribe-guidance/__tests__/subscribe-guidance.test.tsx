import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import SubscriptionGuidancePage from '../page';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => {
      // Default return null to simulate no type parameter
      return null;
    }),
  })),
}));

// Mock next/link with a simple component
jest.mock('next/link', () => {
  return function MockLink(props: React.PropsWithChildren<{ href: string }>) {
    return (
      <a href={props.href} data-testid="mock-link">
        {props.children}
      </a>
    );
  };
});

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

describe('SubscriptionGuidancePage', () => {
  const mockRouter = {
    replace: jest.fn(),
  };
  const mockGetUser = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockSearchParams.get });

    // Default to no type parameter (CFI flow)
    mockSearchParams.get.mockImplementation(() => {
      return null;
    });

    // Setup Supabase mock with authenticated user (CFI by default)
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'test-cfi-id', email: 'cfi@example.com' },
      },
    });

    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'test-cfi-id', role: 'CFI' },
            }),
          })),
        })),
      })),
    });
  });

  it('displays loading state initially', () => {
    // Mock empty localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    render(<SubscriptionGuidancePage />);
    // The component still renders content without a role
    expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
  });

  // Remove the redirects test since the component doesn't check authentication anymore
  // Instead, let's test with missing role
  it('renders the page with limited content when no role is selected', async () => {
    // Mock empty localStorage (no role)
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    await act(async () => {
      render(<SubscriptionGuidancePage />);
    });

    // Basic content should be present
    expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Free Access/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Premium Access/i).length).toBeGreaterThan(0);

    // Role-specific content should be absent
    expect(screen.queryByText(/Unlimited student connections/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Manage unlimited CFIs at your school/i)).not.toBeInTheDocument();
  });

  it('renders the CFI subscription guidance page after loading', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue('cfi'),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    await act(async () => {
      render(<SubscriptionGuidancePage />);
    });

    // Check for content elements instead
    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });

    // Check for CFI specific content
    expect(screen.getByText(/Complete CFI toolkit for effective teaching/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Premium Access/i).length).toBeGreaterThan(0);

    // Verify buttons are present
    expect(screen.getByText(/Get Premium Access/i)).toBeInTheDocument();

    // Check for CFI specific features
    expect(screen.getByText(/Unlimited student connections/i)).toBeInTheDocument();
    expect(screen.getByText(/Create and manage custom lesson plans/i)).toBeInTheDocument();
  });

  it('renders the School Admin subscription guidance page after loading', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue('school_admin'),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    await act(async () => {
      render(<SubscriptionGuidancePage />);
    });

    // Check for content elements instead
    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });

    // Check for School Admin specific content
    expect(screen.getByText(/Full features for managing your flight school/i)).toBeInTheDocument();

    // Verify buttons are present
    expect(screen.getByText(/Continue with Free Access/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Premium Access/i)).toBeInTheDocument();

    // Check for School Admin specific features
    expect(screen.getByText(/Manage unlimited CFIs at your school/i)).toBeInTheDocument();
    expect(screen.getByText(/School-wide analytics and reporting/i)).toBeInTheDocument();
    expect(screen.getByText(/Enhanced school profile with search priority/i)).toBeInTheDocument();
  });
});
