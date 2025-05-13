import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '../ResetPasswordForm';
import { resetPassword } from '@/services/authService';
import { trackEvent } from '@/lib/analytics';
import * as nextNavigation from 'next/navigation';

// Mock the necessary modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockImplementation((param) => {
      if (param === 'token') return 'valid-token';
      return null;
    }),
  }),
}));

jest.mock('@/services/authService', () => ({
  resetPassword: jest.fn(),
}));

jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly with token', () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText('Set New Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('validates password input', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    // Test too short password
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    // Test password without uppercase
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    });

    // Test password without number
    fireEvent.change(passwordInput, { target: { value: 'Password' } });
    fireEvent.change(confirmInput, { target: { value: 'Password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/one number/i)).toBeInTheDocument();
    });

    // Test mismatched passwords
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({ error: null });

    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByRole('button', { name: /resetting password/i })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  it('shows error message on reset failure', async () => {
    const errorMessage = 'Invalid or expired token';
    (resetPassword as jest.Mock).mockResolvedValue({
      error: { message: errorMessage },
    });

    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(resetPassword).toHaveBeenCalledWith('valid-token', 'Password123');
    expect(trackEvent).toHaveBeenCalledWith('password_reset_completed', { success: false });
  });

  it('shows success message and redirects on successful reset', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({ error: null });

    // Mock setTimeout
    jest.useFakeTimers();

    render(<ResetPasswordForm />);

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/successfully reset/i)).toBeInTheDocument();
    });

    expect(resetPassword).toHaveBeenCalledWith('valid-token', 'Password123');
    expect(trackEvent).toHaveBeenCalledWith('password_reset_completed', { success: true });

    // Clean up
    jest.useRealTimers();
  });

  it('handles missing token error', async () => {
    // Override the mock for this test
    jest.spyOn(nextNavigation, 'useSearchParams').mockImplementation(() => ({
      get: () => null,
    }));

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(screen.getByText(/reset token is missing/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    expect(resetPassword).not.toHaveBeenCalled();
    expect(submitButton).toBeDisabled();
  });
});
