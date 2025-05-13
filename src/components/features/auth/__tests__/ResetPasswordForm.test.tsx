import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ResetPasswordForm } from '../ResetPasswordForm';
import { resetPassword } from '@/services/authService';
import { trackEvent } from '@/lib/analytics';

// Store original process.env
const originalEnv = process.env;

// Mock Supabase client
const mockGetSession = jest.fn();
const mockSupabaseClient = {
  auth: {
    getSession: mockGetSession,
  },
};
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => mockSupabaseClient),
}));

// Mock the necessary modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (param: string) => {
      if (param === 'token') return 'test-token';
      if (param === 'type') return 'recovery';
      return null;
    },
  }),
  usePathname: jest.fn(() => '/auth/reset-password'),
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
    // Set up mock environment variables for each test
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    };
    // Default to having a valid session for most tests
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } }, error: null });
  });

  afterEach(() => {
    // Restore original process.env after each test
    process.env = originalEnv;
  });

  it('renders the form correctly', async () => {
    await act(async () => {
      render(<ResetPasswordForm />);
    });

    expect(screen.getByText('Set New Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('validates password input', async () => {
    await act(async () => {
      render(<ResetPasswordForm />);
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    // Test too short password
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmInput, { target: { value: 'short' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    // Test password without uppercase
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'password123' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    });

    // Test password without number
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Password' } });
      fireEvent.change(confirmInput, { target: { value: 'Password' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/one number/i)).toBeInTheDocument();
    });

    // Test mismatched passwords
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmInput, { target: { value: 'Password456' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    let resolveResetPassword: (value: { error: null } | PromiseLike<{ error: null }>) => void;
    const resetPasswordPromise = new Promise<{ error: null }>((resolve) => {
      resolveResetPassword = resolve;
    });
    (resetPassword as jest.Mock).mockReturnValue(resetPasswordPromise);

    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } }, error: null });

    await act(async () => {
      render(<ResetPasswordForm />);
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    });

    // Click the button. The initial setIsSubmitting(true) is synchronous.
    // We don't wrap this specific click in `act` if we want to test the immediate state before promise resolution,
    // but we will use waitFor for the assertion to ensure DOM update.
    fireEvent.click(submitButton);

    // Use waitFor to check for the loading state, allowing React to re-render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resetting password/i })).toBeInTheDocument();
      // Check disabled state within waitFor as well, as it depends on the same re-render
      expect(screen.getByRole('button', { name: /resetting password/i })).toBeDisabled();
    });

    // Now resolve the promise and wait for the component to update
    await act(async () => {
      resolveResetPassword({ error: null });
      await resetPasswordPromise; // Ensure the promise queue is flushed
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  it('shows error message on reset failure', async () => {
    const errorMessage = 'Invalid or expired token';
    (resetPassword as jest.Mock).mockResolvedValue({
      error: { message: errorMessage },
    });
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } }, error: null });

    await act(async () => {
      render(<ResetPasswordForm />);
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(resetPassword).toHaveBeenCalledWith('', 'Password123');
    expect(trackEvent).toHaveBeenCalledWith('password_reset_completed', { success: false });
  });

  it('shows success message and redirects on successful reset', async () => {
    (resetPassword as jest.Mock).mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } }, error: null });

    jest.useFakeTimers();

    await act(async () => {
      render(<ResetPasswordForm />);
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmInput, { target: { value: 'Password123' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/successfully reset/i)).toBeInTheDocument();
    });

    expect(resetPassword).toHaveBeenCalledWith('', 'Password123');
    expect(trackEvent).toHaveBeenCalledWith('password_reset_completed', { success: true });

    jest.useRealTimers();
  });

  it('handles missing Supabase configuration', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
    };

    await act(async () => {
      render(<ResetPasswordForm />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Supabase configuration is missing./i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    expect(submitButton).toBeDisabled(); // Should be disabled if config is missing
  });

  it('handles expired session error', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    await act(async () => {
      render(<ResetPasswordForm />);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Your session has expired. Please try resetting your password again./i)
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    expect(submitButton).toBeDisabled(); // Should be disabled if session is expired

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(resetPassword).not.toHaveBeenCalled();
  });
});
