import { test, expect } from '@playwright/test';

// This is an e2e test to verify the complete School Admin signup flow
test.describe('School Admin Signup Flow', () => {
  // Set timeout to be longer
  test.setTimeout(120000);

  // Skip this test for now as it needs backend mocking
  test.skip('Complete School Admin signup flow (email/password)', async ({ page }) => {
    // Visit the School Admin signup page
    await page.goto('/school-sign-up');
    
    // Wait for page to load completely before attempting assertions
    await page.waitForLoadState('networkidle');
    
    // Check for CardTitle instead of h1
    await expect(page.getByText('Flight School Admin Sign Up')).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/School Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/School Type/i)).toBeVisible();
    await expect(page.getByLabel(/^Password$/i)).toBeVisible();
    await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
    
    // Fill out the form with test data
    await page.getByLabel(/Full Name/i).fill('Test School Admin');
    await page.getByLabel(/School Name/i).fill('Test Flight Academy');
    await page.getByLabel(/Email/i).fill('school-admin@example.com');
    
    // Use more specific selector for SelectTrigger and SelectItem
    await page.getByLabel(/School Type/i).click();
    await page.locator('div[role="option"]').filter({ hasText: 'Part 61' }).click();
    
    await page.getByLabel(/^Password$/i).fill('Password123');
    await page.getByLabel(/Confirm Password/i).fill('Password123');
    
    // Submit the form
    await page.getByRole('button', { name: /Sign Up as School Admin/i }).click();
    
    // Verify success message
    await expect(page.getByText(/Sign up successful! Please check your email/i)).toBeVisible({ timeout: 15000 });
  });
  
  // Skip this test for now as it needs authentication mocking
  test.skip('School Admin profile setup and subscription guidance flow', async ({ page }) => {
    // Visit the profile setup page with School Admin role param
    await page.goto('/profile-setup?role=SCHOOL_ADMIN');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Use a more specific selector based on the actual h1 in the page
    await expect(page.getByRole('heading', { level: 1, name: /Complete Your Flight School Profile/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/You are setting up a Flight School Administrator account/i)).toBeVisible();
    
    // Verify all required fields are present
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/School Name/i)).toBeVisible();
    
    // Fill in profile details
    await page.getByLabel(/Full Name/i).fill('Test School Admin');
    await page.getByLabel(/School Name/i).fill('Test Flight Academy');
    
    // Select Part 141 using a more general selector
    await page.getByText('Part 141').click();
    
    // Submit the form
    await page.getByRole('button', { name: /Save and Continue/i }).click();
    
    // Verify redirect to subscription guidance page
    await page.waitForURL(/\/dashboard\/cfi\/subscribe-guidance\?type=school/, { timeout: 15000 });
    
    // Verify the subscription guidance content for School Admin
    await expect(page.getByText(/Profile Setup Complete!/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Your Flight School profile is ready/i)).toBeVisible();
    await expect(page.getByText(/Next Step: Subscription/i)).toBeVisible();
    
    // Verify school-specific content
    await expect(page.getByText(/including student and instructor management/i)).toBeVisible();
    
    // Verify the navigation options for School Admin
    await expect(page.getByRole('link', { name: /View School Subscription Plans/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Go to School Dashboard/i })).toBeVisible();
  });
  
  test('Form validation for School Admin signup', async ({ page }) => {
    // Visit the School Admin signup page
    await page.goto('/school-sign-up');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Make sure the form is loaded before interacting
    await page.getByRole('button', { name: /Sign Up as School Admin/i }).waitFor({ state: 'visible' });
    
    // Try to submit without any data
    await page.getByRole('button', { name: /Sign Up as School Admin/i }).click();
    
    // Verify validation errors for all required fields
    await expect(page.getByText(/Full name must be at least 2 characters/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/School name must be at least 2 characters/i)).toBeVisible();
    await expect(page.getByText(/Invalid email address/i)).toBeVisible();
    await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
    await expect(page.getByText(/Please select your school type/i)).toBeVisible();
    
    // Test password mismatch
    await page.getByLabel(/Full Name/i).fill('Test School Admin');
    await page.getByLabel(/School Name/i).fill('Test Flight Academy');
    await page.getByLabel(/Email/i).fill('school-admin@example.com');
    
    // Use more specific selectors for the dropdown
    await page.getByLabel(/School Type/i).click();
    await page.locator('div[role="option"]').filter({ hasText: 'Part 61' }).click();
    
    await page.getByLabel(/^Password$/i).fill('Password123');
    await page.getByLabel(/Confirm Password/i).fill('DifferentPassword');
    
    await page.getByRole('button', { name: /Sign Up as School Admin/i }).click();
    
    // Verify password mismatch error
    await expect(page.getByText(/Passwords don't match/i)).toBeVisible({ timeout: 15000 });
  });

  test('Navigation links to other signup options', async ({ page }) => {
    // Visit the School Admin signup page
    await page.goto('/school-sign-up');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Verify links to other signup options
    await expect(page.getByText(/Sign up as a student/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Sign up as a CFI/i)).toBeVisible();
    
    // Test navigation to student signup
    await page.getByText(/Sign up as a student/i).click();
    await page.waitForURL('/sign-up', { timeout: 15000 });
    
    // Go back and test navigation to CFI signup
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.getByText(/Sign up as a CFI/i).click();
    await page.waitForURL('/cfi-sign-up', { timeout: 15000 });
  });

  test('Verify links from other signup pages to School Admin signup', async ({ page }) => {
    // Check link from student signup
    await page.goto('/sign-up');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText(/Sign up as a School Admin/i)).toBeVisible({ timeout: 15000 });
    await page.getByText(/Sign up as a School Admin/i).click();
    await page.waitForURL('/school-sign-up', { timeout: 15000 });
    
    // Check link from CFI signup
    await page.goto('/cfi-sign-up');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText(/Sign up as a School Admin/i)).toBeVisible({ timeout: 15000 });
    await page.getByText(/Sign up as a School Admin/i).click();
    await page.waitForURL('/school-sign-up', { timeout: 15000 });
  });
  
  // Add a TODO comment to implement proper mocking for the skipped tests
  test('TODO: Implement mocking for backend interactions', async () => {
    // This is a placeholder test to remind us to implement proper mocking
    // for the tests that require backend interactions.
    test.skip();
  });
}); 