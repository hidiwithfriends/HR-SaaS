import { test, expect } from '@playwright/test';
import { signupAsOwner, loginAsOwner, logout, clearAuth, getTestCredentials } from './helpers/auth';

test.describe('F1: Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth before each test
    await clearAuth(page);
  });

  test('should sign up as owner and redirect to /stores', async ({ page }) => {
    // Sign up
    const credentials = await signupAsOwner(page);

    // Should be on /stores page
    await expect(page).toHaveURL('/stores');

    // Should see page title
    await expect(page.getByTestId('page-title')).toHaveText('내 매장');

    // Header should show user name
    await expect(page.getByTestId('user-name')).toHaveText(credentials.name);

    // Should see logout button
    await expect(page.getByTestId('logout-button')).toBeVisible();
  });

  test('should login as owner and redirect to /stores', async ({ page }) => {
    // First sign up
    const credentials = await signupAsOwner(page);

    // Logout
    await logout(page);

    // Login again
    await loginAsOwner(page, credentials);

    // Should be on /stores page
    await expect(page).toHaveURL('/stores');

    // Should see page title
    await expect(page.getByTestId('page-title')).toHaveText('내 매장');

    // Header should show user name
    await expect(page.getByTestId('user-name')).toHaveText(credentials.name);
  });

  test('should logout and redirect to /auth/login', async ({ page }) => {
    // First sign up
    await signupAsOwner(page);

    // Logout
    await logout(page);

    // Should be on /auth/login page
    await expect(page).toHaveURL('/auth/login');

    // Should not see header
    await expect(page.getByTestId('user-name')).not.toBeVisible();
  });

  test('should protect /stores page when not authenticated', async ({ page }) => {
    // Try to access /stores without authentication
    await page.goto('/stores');

    // Should redirect to /auth/login
    await page.waitForURL('/auth/login', { timeout: 10000 });
    await expect(page).toHaveURL('/auth/login');
  });

  test('should protect /profile page when not authenticated', async ({ page }) => {
    // Try to access /profile without authentication
    await page.goto('/profile');

    // Should redirect to /auth/login
    await page.waitForURL('/auth/login', { timeout: 10000 });
    await expect(page).toHaveURL('/auth/login');
  });

  test('should show validation errors for invalid signup', async ({ page }) => {
    await page.goto('/auth/signup');

    // Submit without filling form
    await page.getByTestId('submit-button').click();

    // Should stay on signup page (form validation prevents submission)
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Try to login with wrong credentials
    await page.getByTestId('email-input').fill('wrong@test.com');
    await page.getByTestId('password-input').fill('WrongPassword123!');
    await page.getByTestId('submit-button').click();

    // Should see error message
    await expect(page.getByTestId('error-message')).toBeVisible();
  });
});
