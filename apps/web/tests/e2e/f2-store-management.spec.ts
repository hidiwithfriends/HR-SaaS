import { test, expect } from '@playwright/test';
import { signupAsOwner, clearAuth } from './helpers/auth';

test.describe('F2: Store Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth before each test
    await clearAuth(page);
  });

  test('should display store list and navigate to employees page', async ({ page }) => {
    // Sign up as owner
    const credentials = await signupAsOwner(page);

    // Should be on /stores page
    await expect(page).toHaveURL('/stores');
    await expect(page.getByTestId('page-title')).toHaveText('내 매장');

    // Should see the store card with store name
    const storeCard = page.locator('[data-testid^="store-card-"]').first();
    await expect(storeCard).toBeVisible();
    await expect(storeCard.locator('[data-testid^="store-name-"]')).toContainText(credentials.storeName);

    // Click on store card
    await storeCard.click();

    // Should navigate to employees page
    await page.waitForURL(/\/stores\/\d+\/employees/, { timeout: 10000 });
    await expect(page.getByTestId('page-title')).toHaveText('직원 관리');
  });

  test('should display employees list page with buttons for owner', async ({ page }) => {
    // Sign up and navigate to employees page
    await signupAsOwner(page);
    await page.locator('[data-testid^="store-card-"]').first().click();
    await page.waitForURL(/\/stores\/\d+\/employees/);

    // Should see page title
    await expect(page.getByTestId('page-title')).toHaveText('직원 관리');

    // Should see invite button (owner only)
    await expect(page.getByTestId('invite-button')).toBeVisible();

    // Should see settings button (owner only)
    await expect(page.getByTestId('settings-button')).toBeVisible();

    // Should see back button
    await expect(page.getByTestId('back-button')).toBeVisible();
  });

  test('should create employee invite link', async ({ page }) => {
    // Sign up and navigate to employees page
    await signupAsOwner(page);
    await page.locator('[data-testid^="store-card-"]').first().click();
    await page.waitForURL(/\/stores\/\d+\/employees/);

    // Click invite button
    await page.getByTestId('invite-button').click();

    // Should navigate to invites/new page
    await page.waitForURL(/\/stores\/\d+\/invites\/new/);
    await expect(page.getByTestId('page-title')).toHaveText('직원 초대');

    // Fill in invite form
    await page.getByTestId('name-input').fill('Test Employee');
    await page.getByTestId('email-input').fill('employee@test.com');
    await page.getByTestId('phone-input').fill('010-1234-5678');
    await page.getByTestId('position-input').fill('Manager');

    // Submit form
    await page.getByTestId('submit-button').click();

    // Should see success message
    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('success-message')).toContainText('초대 링크가 생성되었습니다');

    // Should see invite link
    await expect(page.getByTestId('invite-link')).toBeVisible();

    // Should see copy button
    await expect(page.getByTestId('copy-button')).toBeVisible();
  });

  test('should update store settings', async ({ page }) => {
    // Sign up and navigate to employees page
    await signupAsOwner(page);
    await page.locator('[data-testid^="store-card-"]').first().click();
    await page.waitForURL(/\/stores\/\d+\/employees/);

    // Click settings button
    await page.getByTestId('settings-button').click();

    // Should navigate to settings page
    await page.waitForURL(/\/stores\/\d+\/settings/);
    await expect(page.getByTestId('page-title')).toHaveText('매장 설정');

    // Update store name
    const newStoreName = 'Updated Store Name';
    await page.getByTestId('name-input').clear();
    await page.getByTestId('name-input').fill(newStoreName);

    // Submit form
    await page.getByTestId('submit-button').click();

    // Should see success message
    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('success-message')).toContainText('매장 정보가 업데이트되었습니다');

    // Store name should be updated in input
    await expect(page.getByTestId('name-input')).toHaveValue(newStoreName);
  });

  test('should navigate to profile page', async ({ page }) => {
    // Sign up
    const credentials = await signupAsOwner(page);

    // Should be on /stores page
    await expect(page).toHaveURL('/stores');

    // Click profile button
    await page.getByTestId('profile-button').click();

    // Should navigate to profile page
    await page.waitForURL('/profile');
    await expect(page.getByTestId('page-title')).toHaveText('내 프로필');

    // Should see user information
    await expect(page.getByTestId('user-name')).toHaveText(credentials.name);
    await expect(page.getByTestId('user-email')).toHaveText(credentials.email);
    await expect(page.getByTestId('user-role')).toHaveText('점주');
  });

  test('should navigate back using back buttons', async ({ page }) => {
    // Sign up and navigate through pages
    await signupAsOwner(page);
    await page.locator('[data-testid^="store-card-"]').first().click();
    await page.waitForURL(/\/stores\/\d+\/employees/);

    // Click invite button
    await page.getByTestId('invite-button').click();
    await page.waitForURL(/\/stores\/\d+\/invites\/new/);

    // Click back button
    await page.getByTestId('back-button').click();

    // Should be back on employees page
    await expect(page).toHaveURL(/\/stores\/\d+\/employees/);

    // Click back button again
    await page.getByTestId('back-button').click();

    // Should be back on stores list
    await expect(page).toHaveURL('/stores');
  });

  test('should show empty state when no employees', async ({ page }) => {
    // Sign up and navigate to employees page
    await signupAsOwner(page);
    await page.locator('[data-testid^="store-card-"]').first().click();
    await page.waitForURL(/\/stores\/\d+\/employees/);

    // Should see no employees message
    await expect(page.getByTestId('no-employees-message')).toBeVisible();
    await expect(page.getByTestId('no-employees-message')).toContainText('등록된 직원이 없습니다');
  });
});
