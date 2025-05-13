import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ForgotPasswordForm } from '../ForgotPasswordForm';
import { requestPasswordReset } from '@/services/authService';
import { trackEvent } from '@/lib/analytics';

// Mock the authService and analytics
jest.mock('@/services/authService', () => ({
  requestPasswordReset: jest.fn(),
}));

jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => jest.fn().mockReturnValue('/forgot-password'),
  redirect: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockNextLink';
  return MockLink;
});

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', async () => {
    await act(async () => {
      render(<ForgotPasswordForm />);
    });

    expect(screen.getByText('Reset your password')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });

  it('validates email input', async () => {
    await act(async () => {
      render(<ForgotPasswordForm />);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    // Test empty email
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: '' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    // Test invalid email format
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    let resolveRequest: (value: { error: null } | PromiseLike<{ error: null }>) => void;
    const requestPromise = new Promise<{ error: null }>((resolve) => {
      resolveRequest = resolve;
    });
    (requestPasswordReset as jest.Mock).mockReturnValue(requestPromise);

    await act(async () => {
      render(<ForgotPasswordForm />);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });

    // Click without act, then assert with waitFor for synchronous state change
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled(); // Check the loading button is disabled
    });

    // Resolve the promise
    await act(async () => {
      resolveRequest({ error: null });
      await requestPromise; // Ensure promise queue is flushed
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });
  });

  it('shows error message on server error', async () => {
    const errorMessage = 'Server error occurred';
    (requestPasswordReset as jest.Mock).mockResolvedValue({
      error: { message: errorMessage },
    });

    await act(async () => {
      render(<ForgotPasswordForm />);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(trackEvent).toHaveBeenCalledWith('password_reset_requested', { success: false });
  });

  it('shows success message on valid submission', async () => {
    (requestPasswordReset as jest.Mock).mockResolvedValue({ error: null });

    await act(async () => {
      render(<ForgotPasswordForm />);
    });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/password reset instructions have been sent/i)).toBeInTheDocument();
    });

    expect(requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    expect(trackEvent).toHaveBeenCalledWith('password_reset_requested', { success: true });
  });
});
