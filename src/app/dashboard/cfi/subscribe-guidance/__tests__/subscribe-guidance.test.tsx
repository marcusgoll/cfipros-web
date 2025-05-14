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

  // Define localStorage mock utility
  const mockLocalStorage = (role: string | null) => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => (key === 'selectedRole' ? role : null)),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockSearchParams.get });

    // Default to no type parameter
    mockSearchParams.get.mockImplementation(() => null);

    // Default localStorage mock (e.g., CFI role)
    mockLocalStorage('cfi'); // Default to CFI for most tests

    // Setup Supabase mock with authenticated user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'test-user-id', email: 'user@example.com' },
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
              data: { id: 'test-user-id', role: 'CFI' }, // Default role in DB mock
            }),
          })),
        })),
      })),
    });
  });

  it('displays loading state initially and then content for default role (CFI)', async () => {
    // No specific localStorage mock here, uses default from beforeEach (CFI)
    await act(async () => {
      render(<SubscriptionGuidancePage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Complete CFI toolkit for effective teaching/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlimited student connections/i)).toBeInTheDocument();
  });

  it('renders the page with limited content when no role is selected in localStorage', async () => {
    mockLocalStorage(null); // Override default to simulate no role

    await act(async () => {
      render(<SubscriptionGuidancePage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });
    expect(screen.queryAllByText(/Free Access/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Premium Access/i).length).toBeGreaterThan(0);

    // Key role-specific features should be absent or generic
    expect(screen.queryByText(/Unlimited student connections/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Manage unlimited CFIs at your school/i)).not.toBeInTheDocument();
    // Check for the generic premium description when no role
    expect(screen.getByText(/Full features for managing your flight school/i)).toBeInTheDocument();
  });

  it('renders the CFI subscription guidance page after loading', async () => {
    mockLocalStorage('cfi'); // Explicitly set CFI role

    await act(async () => {
      render(<SubscriptionGuidancePage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Complete CFI toolkit for effective teaching/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Premium Access/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Get Premium Access/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlimited student connections/i)).toBeInTheDocument();
    expect(screen.getByText(/Create and manage custom lesson plans/i)).toBeInTheDocument();
  });

  it('renders the School Admin subscription guidance page after loading', async () => {
    mockLocalStorage('school_admin'); // Explicitly set School Admin role

    await act(async () => {
      render(<SubscriptionGuidancePage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Full features for managing your flight school/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Free Access/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Premium Access/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage unlimited CFIs at your school/i)).toBeInTheDocument();
    expect(screen.getByText(/School-wide analytics and reporting/i)).toBeInTheDocument();
    expect(screen.getByText(/Enhanced school profile with search priority/i)).toBeInTheDocument();
  });
});
