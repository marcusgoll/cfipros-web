import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SchoolSignUpForm } from '../SchoolSignUpForm';
import { signUpWithEmailSchool } from '@/lib/supabase/auth';
import { LinkProps } from 'next/link';

// Mock the auth module
jest.mock('@/lib/supabase/auth', () => ({
  signUpWithEmailSchool: jest.fn(),
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
  return function MockLink(props: React.PropsWithChildren<LinkProps>) {
    return <a {...props}>{props.children}</a>;
  };
});

describe('SchoolSignUpForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the school sign-up form with all required fields', () => {
    render(<SchoolSignUpForm />);
    
    // Check for form fields
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/School Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/School Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /Sign Up as School Admin/i })).toBeInTheDocument();
    
    // Check for OAuth component
    expect(screen.getByTestId('oauth-providers')).toBeInTheDocument();
    
    // Check for student and CFI signup links
    expect(screen.getByText(/Not a Flight School Administrator\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up as a student/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up as a CFI/i)).toBeInTheDocument();
  });

  it('validates form inputs and shows error messages', async () => {
    render(<SchoolSignUpForm />);
    
    // Try to submit with empty fields
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Sign Up as School Admin/i }));
    });
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/School name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Please select your school type/i)).toBeInTheDocument();
    });
  });

  it('validates password matching', async () => {
    render(<SchoolSignUpForm />);
    
    // Fill form with mismatched passwords
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/School Name/i), {
        target: { value: 'Acme Flight School' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'admin@school.com' },
      });
      // Select school type
      fireEvent.mouseDown(screen.getByLabelText(/School Type/i));
      fireEvent.click(screen.getByText(/Part 61/i));
      
      fireEvent.change(screen.getByLabelText(/^Password$/i), {
        target: { value: 'Password123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'Password456' },
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Sign Up as School Admin/i }));
    });
    
    // Check for password match error
    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully and shows success message', async () => {
    // Mock successful signup
    (signUpWithEmailSchool as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id', email: 'admin@school.com' },
      error: null,
    });
    
    render(<SchoolSignUpForm />);
    
    // Fill form with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/School Name/i), {
        target: { value: 'Acme Flight School' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'admin@school.com' },
      });
      // Select school type
      fireEvent.mouseDown(screen.getByLabelText(/School Type/i));
      fireEvent.click(screen.getByText(/Part 61/i));
      
      fireEvent.change(screen.getByLabelText(/^Password$/i), {
        target: { value: 'Password123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'Password123' },
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Sign Up as School Admin/i }));
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Sign up successful! Please check your email/i)).toBeInTheDocument();
    });
    
    // Verify the auth function was called with correct params
    expect(signUpWithEmailSchool).toHaveBeenCalledWith({
      fullName: 'John Doe',
      schoolName: 'Acme Flight School',
      email: 'admin@school.com',
      part61Or141Type: 'PART_61',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
  });

  it('handles user already exists error', async () => {
    // Mock user already exists error
    (signUpWithEmailSchool as jest.Mock).mockResolvedValue({
      user: null,
      error: { message: 'User already registered' },
    });
    
    render(<SchoolSignUpForm />);
    
    // Fill form with valid data
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: 'John Doe' },
      });
      fireEvent.change(screen.getByLabelText(/School Name/i), {
        target: { value: 'Acme Flight School' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'existing@school.com' },
      });
      // Select school type
      fireEvent.mouseDown(screen.getByLabelText(/School Type/i));
      fireEvent.click(screen.getByText(/Part 61/i));
      
      fireEvent.change(screen.getByLabelText(/^Password$/i), {
        target: { value: 'Password123' },
      });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
        target: { value: 'Password123' },
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Sign Up as School Admin/i }));
    });
    
    // Check for already registered message
    await waitFor(() => {
      expect(screen.getByText(/This email is already registered/i)).toBeInTheDocument();
      expect(screen.getByText(/log in/i)).toBeInTheDocument();
    });
  });
}); 