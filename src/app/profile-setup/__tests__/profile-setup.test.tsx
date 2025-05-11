import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileSetupPage from '../page';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock configuration for different roles
const mockRoles = {
  cfi: 'CFI',
  schoolAdmin: 'SCHOOL_ADMIN',
  student: null, // Default is student
};

// Mock the Next.js router with configurable role parameter
const createMockSearchParams = (role: string | null) => ({
  get: jest.fn((param) => {
    if (param === 'role') return role;
    return null;
  }),
});

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
  useSearchParams: jest.fn(() => createMockSearchParams(mockRoles.cfi)), // Default to CFI
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

describe('ProfileSetupPage Integration', () => {
  const mockRouter = {
    replace: jest.fn(),
  };
  const mockGetUser = jest.fn();
  const mockInsert = jest.fn();
  let mockUserMetadata = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserMetadata = {}; // Reset user metadata

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Setup Supabase mock
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: mockUserMetadata,
        },
      },
    });

    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: null }), // No profile yet
          })),
        })),
        insert: mockInsert.mockResolvedValue({ error: null }),
      })),
    });
  });

  it('loads correctly and sets CFI role from URL parameter', async () => {
    // Set the useSearchParams mock to return CFI role
    (useSearchParams as jest.Mock).mockReturnValue(createMockSearchParams(mockRoles.cfi));

    render(<ProfileSetupPage />);

    // Wait for loading to complete
    await waitFor(() => {
      // Check page title contains CFI
      expect(screen.getByText(/Complete Your CFI Profile/i)).toBeInTheDocument();
    });
  });

  it('loads correctly and sets School Admin role from URL parameter', async () => {
    // Set the useSearchParams mock to return School Admin role
    (useSearchParams as jest.Mock).mockReturnValue(createMockSearchParams(mockRoles.schoolAdmin));

    render(<ProfileSetupPage />);

    // Wait for loading to complete
    await waitFor(() => {
      // Check page title contains School profile
      expect(screen.getByText(/Complete Your Flight School Profile/i)).toBeInTheDocument();
      // Check for school-specific fields
      expect(screen.getByLabelText(/School Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/School Type/i)).toBeInTheDocument();
    });
  });

  it('pre-populates fields from user metadata for School Admin', async () => {
    // Set up School Admin metadata
    mockUserMetadata = {
      full_name: 'Jane Smith',
      role: 'SCHOOL_ADMIN',
      school_name: 'Skyward Aviation',
      part_61_or_141_type: 'PART_141',
    };

    // Set the useSearchParams mock to return School Admin role
    (useSearchParams as jest.Mock).mockReturnValue(createMockSearchParams(mockRoles.schoolAdmin));

    render(<ProfileSetupPage />);

    // Wait for loading to complete
    await waitFor(() => {
      // Check pre-populated fields
      expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Jane Smith');
      expect(screen.getByLabelText(/School Name/i)).toHaveValue('Skyward Aviation');
      // Check that Part 141 radio button is selected
      expect(screen.getByLabelText(/Part 141/i)).toBeChecked();
    });
  });

  it('submits form with full name and creates profile with CFI role', async () => {
    // Set the useSearchParams mock to return CFI role
    (useSearchParams as jest.Mock).mockReturnValue(createMockSearchParams(mockRoles.cfi));

    render(<ProfileSetupPage />);

    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'John Doe' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save and Continue/i }));

    // Verify profile creation with CFI role
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'test-user-id',
        full_name: 'John Doe',
        email: 'test@example.com',
        role: 'CFI',
      });
    });

    // Verify redirect to subscription guidance
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard/cfi/subscribe-guidance');
  });

  it('submits form and creates profile with School Admin role and school record', async () => {
    // Set the useSearchParams mock to return School Admin role
    (useSearchParams as jest.Mock).mockReturnValue(createMockSearchParams(mockRoles.schoolAdmin));

    // Mock the school insert function
    const mockSchoolInsert = jest.fn().mockResolvedValue({ error: null });

    // Update the Supabase mock to include school table
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
      from: jest.fn((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: null }), // No profile yet
              })),
            })),
            insert: mockInsert.mockResolvedValue({ error: null }),
          };
        } else if (table === 'schools') {
          return {
            insert: mockSchoolInsert,
          };
        }
        return {};
      }),
    });

    render(<ProfileSetupPage />);

    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Jane Smith' },
    });

    fireEvent.change(screen.getByLabelText(/School Name/i), {
      target: { value: 'Skyward Aviation' },
    });

    // Select Part 141
    fireEvent.click(screen.getByLabelText(/Part 141/i));

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Save and Continue/i }));

    // Verify profile creation with School Admin role
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        id: 'test-user-id',
        full_name: 'Jane Smith',
        email: 'test@example.com',
        role: 'SCHOOL_ADMIN',
      });
    });

    // Verify school record creation
    expect(mockSchoolInsert).toHaveBeenCalledWith({
      name: 'Skyward Aviation',
      admin_user_id: 'test-user-id',
      part_61_or_141_type: 'PART_141',
    });

    // Verify redirect to subscription guidance with school type parameter
    expect(mockRouter.replace).toHaveBeenCalledWith(
      '/dashboard/cfi/subscribe-guidance?type=school'
    );
  });

  it('redirects to login if user not authenticated', async () => {
    // Mock no user found
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    render(<ProfileSetupPage />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to dashboard if profile already exists (CFI)', async () => {
    // Mock existing CFI profile
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser.mockResolvedValue({
          data: {
            user: { id: 'existing-user-id', email: 'existing@example.com' },
          },
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'existing-user-id', role: 'CFI' },
            }),
          })),
        })),
      })),
    });

    render(<ProfileSetupPage />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard/cfi');
    });
  });

  it('redirects to dashboard if profile already exists (School Admin)', async () => {
    // Mock existing School Admin profile
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser.mockResolvedValue({
          data: {
            user: { id: 'existing-user-id', email: 'school@example.com' },
          },
        }),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'existing-user-id', role: 'SCHOOL_ADMIN' },
            }),
          })),
        })),
      })),
    });

    render(<ProfileSetupPage />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard/school');
    });
  });
});
