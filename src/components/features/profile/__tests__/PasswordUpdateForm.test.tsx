import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordUpdateForm from '../PasswordUpdateForm';
import { updatePassword } from '@/lib/supabase/auth';
import { trackEvent } from '@/lib/analytics';
import type { User } from '@supabase/supabase-js';

// Mock the modules
jest.mock('@/lib/supabase/auth', () => ({
  updatePassword: jest.fn(),
}));

jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
  EVENTS: {
    PASSWORD_UPDATED: 'password_updated',
  },
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  InfoIcon: () => <span data-testid="info-icon" />,
}));

describe('PasswordUpdateForm', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {
      provider: 'email',
    },
  } as User;
  
  const mockOAuthUser = {
    id: 'oauth-user-123',
    email: 'oauth-user@example.com',
    app_metadata: {
      provider: 'google',
    },
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with empty fields for email users', () => {
    render(<PasswordUpdateForm user={mockUser} />);
    
    expect(screen.getByLabelText(/Current Password/i)).toHaveValue('');
    
    // Use name attribute to get specific fields since labels might be ambiguous
    const newPasswordField = screen.getByPlaceholderText('Your new password');
    const confirmPasswordField = screen.getByPlaceholderText('Confirm your new password');
    
    expect(newPasswordField).toHaveValue('');
    expect(confirmPasswordField).toHaveValue('');
  });

  it('shows OAuth message for OAuth users', async () => {
    render(<PasswordUpdateForm user={mockOAuthUser} />);
    
    // The component needs a tick to run the useEffect
    await waitFor(() => {
      expect(screen.getByText(/OAuth Account/i)).toBeInTheDocument();
      expect(screen.getByText(/Password management is handled by your provider/i)).toBeInTheDocument();
    });
    
    // Form fields should not be rendered
    expect(screen.queryByLabelText(/Current Password/i)).not.toBeInTheDocument();
  });

  it('validates form inputs correctly', async () => {
    render(<PasswordUpdateForm user={mockUser} />);
    
    // Submit with empty fields
    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    fireEvent.click(submitButton);
    
    // Check validation messages
    await waitFor(() => {
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
    });
  });

  it('validates password matching correctly', async () => {
    render(<PasswordUpdateForm user={mockUser} />);
    
    // Fill in fields with mismatched passwords
    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByPlaceholderText('Your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    
    fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    fireEvent.click(submitButton);
    
    // Check validation message
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    // Mock successful password update
    jest.mocked(updatePassword).mockResolvedValue({ error: null });
    
    render(<PasswordUpdateForm user={mockUser} />);
    
    // Fill in fields with valid data
    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByPlaceholderText('Your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    
    fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    fireEvent.click(submitButton);
    
    // Check if the updatePassword function was called with correct parameters
    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith({
        currentPassword: 'CurrentPass123',
        newPassword: 'NewPassword123',
      });
    });
    
    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Password updated successfully')).toBeInTheDocument();
    });
    
    // Check if analytics event was tracked
    expect(trackEvent).toHaveBeenCalledWith('password_updated', {});
  });

  it('shows error message when update fails', async () => {
    // Mock failed password update
    const errorMessage = 'Password update failed';
    jest.mocked(updatePassword).mockResolvedValue({ error: { message: errorMessage } });
    
    render(<PasswordUpdateForm user={mockUser} />);
    
    // Fill in fields with valid data
    const currentPasswordInput = screen.getByLabelText(/Current Password/i);
    const newPasswordInput = screen.getByPlaceholderText('Your new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
    
    fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Update Password/i });
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Check that analytics event was not tracked
    expect(trackEvent).not.toHaveBeenCalled();
  });
}); 