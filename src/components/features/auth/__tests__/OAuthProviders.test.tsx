import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { OAuthProviders } from '../OAuthProviders';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

describe('OAuthProviders Component', () => {
  const mockSignInWithOAuth = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithOAuth: mockSignInWithOAuth,
      },
    });
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  it('renders the Google OAuth button with correct text for signup', () => {
    render(<OAuthProviders variant="signup" />);
    const button = screen.getByRole('button', { name: /Sign up with Google/i });
    expect(button).toBeInTheDocument();
  });

  it('renders the Google OAuth button with correct text for login', () => {
    render(<OAuthProviders variant="login" />);
    const button = screen.getByRole('button', { name: /Log in with Google/i });
    expect(button).toBeInTheDocument();
  });

  it('calls signInWithOAuth when Google button is clicked', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    render(<OAuthProviders />);
    
    const button = screen.getByRole('button', { name: /Sign up with Google/i });
    
    await act(async () => {
      fireEvent.click(button);
    });
    
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  });

  it('shows error message when OAuth sign-in fails', async () => {
    mockSignInWithOAuth.mockResolvedValue({ 
      error: { message: 'Auth error' } 
    });
    
    render(<OAuthProviders />);
    
    const button = screen.getByRole('button', { name: /Sign up with Google/i });
    
    await act(async () => {
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to sign in with google/i)).toBeInTheDocument();
    });
  });
}); 