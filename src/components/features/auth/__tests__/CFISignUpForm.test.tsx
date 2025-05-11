import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CFISignUpForm } from '../CFISignUpForm';
import { signUpWithEmailCFI } from '@/lib/supabase/auth';

// Mock the auth module
jest.mock('@/lib/supabase/auth', () => ({
  signUpWithEmailCFI: jest.fn(),
}));

// Mock OAuthProviders component
jest.mock('../OAuthProviders', () => ({
  OAuthProviders: () => {
    return <div data-testid="oauth-providers">OAuth Providers</div>;
  }
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink(props: any) {
    return <a {...props}>{props.children}</a>;
  };
});

describe('CFISignUpForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sign-up form with all required fields', () => {
    render(<CFISignUpForm />);
    
    // Check for form fields
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /Sign Up as CFI/i })).toBeInTheDocument();
    
    // Check for OAuth component
    expect(screen.getByTestId('oauth-providers')).toBeInTheDocument();
    
    // Check for student signup link
    expect(screen.getByText(/Not a Flight Instructor\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up as a student/i)).toBeInTheDocument();
  });

  it('validates form inputs and shows error messages', async () => {
    render(<CFISignUpForm />);
    
    // Try to submit with empty fields
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign Up as CFI/i }));
    });
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password matching', async () => {
    render(<CFISignUpForm />);
    
    // Fill form with mismatched passwords
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Password$/i), {
        target: { value: 'Password123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'Password456' },
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Sign Up as CFI/i }));
    });
    
    // Check for password match error
    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully and shows success message', async () => {
    // Mock successful signup
    (signUpWithEmailCFI as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      error: null,
    });
    
    render(<CFISignUpForm />);
    
    // Fill form with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Password$/i), {
        target: { value: 'Password123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'Password123' },
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Sign Up as CFI/i }));
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Sign up successful! Please check your email/i)).toBeInTheDocument();
    });
    
    // Verify the auth function was called with correct params
    expect(signUpWithEmailCFI).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
  });

  it('handles user already exists error', async () => {
    // Mock user already exists error
    (signUpWithEmailCFI as jest.Mock).mockResolvedValue({
      user: null,
      error: { message: 'User already registered' },
    });
    
    render(<CFISignUpForm />);
    
    // Fill form with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'existing@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Password$/i), {
        target: { value: 'Password123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'Password123' },
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Sign Up as CFI/i }));
    });
    
    // Check for already registered message
    await waitFor(() => {
      expect(screen.getByText(/This email is already registered/i)).toBeInTheDocument();
      expect(screen.getByText(/log in/i)).toBeInTheDocument();
    });
  });
}); 