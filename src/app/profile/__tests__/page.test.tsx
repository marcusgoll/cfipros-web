import ProfilePage from '../page';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/components/features/profile/ProfileForm', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Profile Form</div>),
}));

jest.mock('@/components/features/profile/PasswordUpdateForm', () => ({
  __esModule: true,
  default: jest.fn(() => <div>Password Update Form</div>),
}));

// Type for mocked Supabase client
type MockedSupabaseClient = {
  auth: {
    getUser: jest.Mock;
  };
  from: jest.Mock;
};

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login page when user is not authenticated', async () => {
    // Mock Supabase response for unauthenticated user
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    };
    // @ts-expect-error - Mocked client for testing purposes
    jest.mocked(createSupabaseServerClient).mockReturnValue(mockSupabase as MockedSupabaseClient);

    await ProfilePage();

    // Check if redirect was called with '/login'
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('fetches profile data for authenticated user', async () => {
    // Mock Supabase responses for authenticated user
    const mockUser = { id: 'user-123', email: 'test@example.com' } as User;
    const mockProfile = { id: 'user-123', full_name: 'Test User' };

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      }),
    };
    // @ts-expect-error - Mocked client for testing purposes
    jest.mocked(createSupabaseServerClient).mockReturnValue(mockSupabase as MockedSupabaseClient);

    // Try to render the component - it will not actually render in this test
    // since it's a server component, but we can check that it doesn't redirect
    await ProfilePage();

    // Verify that it didn't redirect
    expect(redirect).not.toHaveBeenCalled();

    // Verify that it attempted to fetch the profile
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });

  it('creates a profile if none exists', async () => {
    // Mock Supabase responses for authenticated user with no profile
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User', role: 'STUDENT' },
    } as unknown as User;

    const mockProfile = { id: 'user-123', full_name: 'Test User' };

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null, // No profile exists
              error: null,
            }),
          }),
        }),
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      }),
    };
    // @ts-expect-error - Mocked client for testing purposes
    jest.mocked(createSupabaseServerClient).mockReturnValue(mockSupabase as MockedSupabaseClient);

    await ProfilePage();

    // Verify it tried to create a profile
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.from().upsert).toHaveBeenCalled();
  });
});
