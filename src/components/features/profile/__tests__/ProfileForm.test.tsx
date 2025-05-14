import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileForm from '../ProfileForm';
import { updateProfile } from '@/lib/supabase/auth';
import { trackEvent } from '@/lib/analytics';
import type { User } from '@supabase/supabase-js';
// @ts-expect-error - This module path is missing but used in tests
import type { Profile } from '@/lib/types/database';

// Mock the modules
jest.mock('@/lib/supabase/auth', () => ({
  updateProfile: jest.fn(),
}));

jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
  EVENTS: {
    PROFILE_UPDATED: 'profile_updated',
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
  }),
}));

describe('ProfileForm', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  } as User;

  const mockProfile = {
    id: 'user-123',
    full_name: 'Test User',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  } as Profile;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with user data', () => {
    render(<ProfileForm user={mockUser} profile={mockProfile} />);

    expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Test User');
    // @ts-expect-error - email might be undefined in tests
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    // Mock successful profile update
    (updateProfile as jest.MockedFunction<typeof updateProfile>).mockResolvedValue({ error: null });

    render(<ProfileForm user={mockUser} profile={mockProfile} />);

    // Change input value
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Update Profile/i });
    fireEvent.click(submitButton);

    // Check if the updateProfile function was called with correct parameters
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        userId: mockUser.id,
        fullName: 'Updated Name',
      });
    });

    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });

    // Check if analytics event was tracked
    expect(trackEvent).toHaveBeenCalledWith('profile_updated', { userId: mockUser.id });
  });

  it('shows error message when update fails', async () => {
    // Mock failed profile update
    const errorMessage = 'Profile update failed';
    // Type the error properly for the mock
    type UpdateProfileReturn = Awaited<ReturnType<typeof updateProfile>>;
    // Mock the resolved promise with a type-safe error object
    (updateProfile as jest.MockedFunction<typeof updateProfile>).mockResolvedValue({
      error: { message: errorMessage },
    } as unknown as UpdateProfileReturn);

    render(<ProfileForm user={mockUser} profile={mockProfile} />);

    // Submit the form without changing the value
    const submitButton = screen.getByRole('button', { name: /Update Profile/i });
    fireEvent.click(submitButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Check that analytics event was not tracked
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
