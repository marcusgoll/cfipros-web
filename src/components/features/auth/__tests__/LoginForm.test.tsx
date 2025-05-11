import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { loginWithEmail } from '@/lib/supabase/auth';
import { LinkProps } from 'next/link';

// Mock the server action
jest.mock('@/lib/supabase/auth', () => ({
  loginWithEmail: jest.fn(),
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink(props: React.PropsWithChildren<LinkProps>) {
    return <a {...props}>{props.children}</a>;
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders login form with email and password fields', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<LoginForm />);
    
    // Submit the form without filling in any fields
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    // Mock successful login
    (loginWithEmail as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' },
      session: { access_token: 'test-token' },
      error: null,
    });
    
    render(<LoginForm />);
    
    // Fill in form fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'password123' } 
      });
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });
    
    // Check that loginWithEmail was called with the correct values
    await waitFor(() => {
      expect(loginWithEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
  });

  it('shows error message on invalid credentials', async () => {
    // Mock failed login
    (loginWithEmail as jest.Mock).mockResolvedValue({
      user: null,
      session: null,
      error: {
        message: 'Invalid login credentials',
      },
    });
    
    render(<LoginForm />);
    
    // Fill in form fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'wrongpassword' } 
      });
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('shows error message for unverified email', async () => {
    // Mock failed login due to unverified email
    (loginWithEmail as jest.Mock).mockResolvedValue({
      user: null,
      session: null,
      error: {
        message: 'Email not confirmed',
      },
    });
    
    render(<LoginForm />);
    
    // Fill in form fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'unverified@example.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'password123' } 
      });
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    });
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/your email has not been verified/i)).toBeInTheDocument();
    });
  });
}); 