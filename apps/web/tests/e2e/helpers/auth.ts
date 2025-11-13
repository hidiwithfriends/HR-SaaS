import { Page } from '@playwright/test';

/**
 * Generate a unique test email
 */
export function getTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}@test.com`;
}

/**
 * Generate test credentials
 */
export function getTestCredentials() {
  return {
    email: getTestEmail('owner'),
    password: 'Test1234!',
    name: 'Test Owner',
    storeName: 'Test Store',
  };
}

/**
 * Sign up as a new owner
 */
export async function signupAsOwner(page: Page, credentials?: {
  email?: string;
  password?: string;
  name?: string;
  storeName?: string;
}) {
  const creds = {
    email: credentials?.email || getTestEmail('owner'),
    password: credentials?.password || 'Test1234!',
    name: credentials?.name || 'Test Owner',
    storeName: credentials?.storeName || 'Test Store',
  };

  // Navigate to signup page
  await page.goto('/auth/signup');

  // Fill in the form
  await page.getByTestId('name-input').fill(creds.name);
  await page.getByTestId('email-input').fill(creds.email);
  await page.getByTestId('password-input').fill(creds.password);
  await page.getByTestId('password-confirm-input').fill(creds.password);
  await page.getByTestId('store-name-input').fill(creds.storeName);
  await page.getByTestId('agree-terms-checkbox').check();

  // Submit the form
  await page.getByTestId('submit-button').click();

  // Wait for navigation to /stores
  await page.waitForURL('/stores', { timeout: 10000 });

  return creds;
}

/**
 * Login as owner
 */
export async function loginAsOwner(page: Page, credentials: {
  email: string;
  password: string;
}) {
  // Navigate to login page
  await page.goto('/auth/login');

  // Fill in the form
  await page.getByTestId('email-input').fill(credentials.email);
  await page.getByTestId('password-input').fill(credentials.password);

  // Submit the form
  await page.getByTestId('submit-button').click();

  // Wait for navigation to /stores
  await page.waitForURL('/stores', { timeout: 10000 });
}

/**
 * Logout
 */
export async function logout(page: Page) {
  // Click logout button in header
  await page.getByTestId('logout-button').click();

  // Wait for navigation to /auth/login
  await page.waitForURL('/auth/login', { timeout: 10000 });
}

/**
 * Clear all auth data from localStorage
 */
export async function clearAuth(page: Page) {
  // First navigate to a page to access localStorage
  try {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
  } catch (error) {
    // If there's an error, it's likely because the page hasn't loaded yet
    // We can safely ignore this as the auth will be cleared on next navigation
  }
}
