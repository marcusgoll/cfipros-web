import { requestPasswordReset, resetPassword, getCurrentUser } from '../authService';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

describe('authService', () => {
  const mockSupabaseClient = {
    auth: {
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Mock process.env
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  });

  describe('requestPasswordReset', () => {
    it('should request a password reset successfully', async () => {
      // Setup
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      // Execute
      const result = await requestPasswordReset('test@example.com');

      // Verify
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'https://example.com/auth/reset-password',
        }
      );
      expect(result.error).toBeNull();
    });

    it('should handle errors during password reset request', async () => {
      // Setup
      const mockError = { message: 'An error occurred' };
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: mockError,
      });

      // Execute
      const result = await requestPasswordReset('test@example.com');

      // Verify
      expect(result.error).toEqual(mockError);
    });
  });

  describe('resetPassword', () => {
    it('should reset a password successfully', async () => {
      // Setup
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: null,
      });

      // Execute
      const result = await resetPassword('valid-token', 'newPassword123');

      // Verify
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      });
      expect(result.error).toBeNull();
    });

    it('should handle errors during password reset', async () => {
      // Setup
      const mockError = { message: 'Invalid token' };
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: mockError,
      });

      // Execute
      const result = await resetPassword('invalid-token', 'newPassword123');

      // Verify
      expect(result.error).toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user if authenticated', async () => {
      // Setup
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      // Execute
      const result = await getCurrentUser();

      // Verify
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is authenticated', async () => {
      // Setup
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      // Execute
      const result = await getCurrentUser();

      // Verify
      expect(result).toBeNull();
    });
  });
});
