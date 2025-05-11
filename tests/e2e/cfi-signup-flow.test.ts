import { test, expect } from '@playwright/test';

// This is an e2e test to verify the complete CFI signup flow
test.describe('CFI Signup Flow', () => {
  test('Complete CFI signup flow (email/password)', async ({ page }) => {
    // Visit the CFI signup page
    await page.goto('/cfi-sign-up');
    
    // Verify the page title and form elements
    await expect(page.getByRole('heading', { name: /Sign Up as CFI/i })).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/^Password$/i)).toBeVisible();
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
    
    // Fill out the form with test data
    await page.getByLabel(/Email/i).fill('test-cfi@example.com');
    await page.getByLabel(/^Password$/i).fill('Password123');
    await page.getByLabel(/Confirm Password/i).fill('Password123');
    
    // Submit the form
    await page.getByRole('button', { name: /Sign Up as CFI/i }).click();
    
    // Verify success message
    await expect(page.getByText(/Sign up successful! Please check your email/i)).toBeVisible();
    
    // Note: In a full E2E test, we would mock the email verification here
    // and proceed to the profile setup, but that's typically done with a
    // custom setup or intercept in the actual test environment
  });
  
  test('CFI profile setup and subscription guidance flow', async ({ page }) => {
    // This test assumes user is authenticated and at the profile setup page
    // In real tests, we would use auth helpers or API calls to set up this state
    
    // Visit the profile setup page with CFI role param
    await page.goto('/profile-setup?role=CFI');
    
    // Verify the profile setup page loads correctly
    await expect(page.getByText(/Complete Your CFI Profile/i)).toBeVisible();
    await expect(page.getByText(/You are setting up a Certified Flight Instructor account/i)).toBeVisible();
    
    // Fill in profile details
    await page.getByLabel(/Full Name/i).fill('Test CFI Instructor');
    
    // Submit the form
    await page.getByRole('button', { name: /Save and Continue/i }).click();
    
    // Verify redirect to subscription guidance page
    await expect(page).toHaveURL(/\/dashboard\/cfi\/subscribe-guidance/);
    
    // Verify the subscription guidance content
    await expect(page.getByText(/Profile Setup Complete!/i)).toBeVisible();
    await expect(page.getByText(/Next Step: Subscription/i)).toBeVisible();
    
    // Verify the navigation options
    await expect(page.getByRole('link', { name: /View Subscription Plans/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Go to CFI Dashboard/i })).toBeVisible();
  });
  
  test('OAuth signup with Google for CFI', async ({ page }) => {
    // Visit the CFI signup page
    await page.goto('/cfi-sign-up');
    
    // Verify the OAuth button is present
    await expect(page.getByRole('button', { name: /Sign up with Google/i })).toBeVisible();
    
    // Note: Testing actual OAuth flow requires special handling or mocking
    // This is typically done with custom interceptors in a real test setup
  });
  
  test('Form validation for CFI signup', async ({ page }) => {
    // Visit the CFI signup page
    await page.goto('/cfi-sign-up');
    
    // Try to submit without any data
    await page.getByRole('button', { name: /Sign Up as CFI/i }).click();
    
    // Verify validation errors
    await expect(page.getByText(/Invalid email address/i)).toBeVisible();
    await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
    
    // Test password mismatch
    await page.getByLabel(/Email/i).fill('test-cfi@example.com');
    await page.getByLabel(/^Password$/i).fill('Password123');
    await page.getByLabel(/Confirm Password/i).fill('DifferentPassword');
    
    await page.getByRole('button', { name: /Sign Up as CFI/i }).click();
    
    // Verify password mismatch error
    await expect(page.getByText(/Passwords don't match/i)).toBeVisible();
  });
}); 