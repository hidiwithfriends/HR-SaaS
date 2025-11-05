import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clean up any existing cookies
    await page.context().clearCookies();
  });

  test('[UX-1.1] Owner signup and login flow', async ({ page }) => {
    // Step 1: Landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('BestPractice HR SaaS');
    await expect(page.locator('text=성공하는 사장님의 비법을')).toBeVisible();

    // Click "무료로 시작하기" button
    await page.click('text=무료로 시작하기');
    await expect(page).toHaveURL('/auth/signup');

    // Step 2: Signup form
    await expect(page.locator('h2')).toContainText('점주 회원가입');

    const timestamp = Date.now();
    const testEmail = `owner${timestamp}@test.com`;

    await page.fill('#email', testEmail);
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');
    await page.fill('#name', '테스트점주');
    await page.fill('#phone', '010-1234-5678');
    await page.fill('#storeName', '테스트카페');
    await page.selectOption('#storeType', 'CAFE');

    // Submit signup form
    await page.click('button[type="submit"]');

    // Step 3: Redirect to login page with success message
    await expect(page).toHaveURL(/\/auth\/login\?signup=success/);
    await expect(page.locator('text=회원가입이 완료되었습니다')).toBeVisible();

    // Step 4: Login with newly created account
    await page.fill('#email', testEmail);
    await page.fill('#password', 'TestPass123!');
    await page.click('button[type="submit"]');

    // Step 5: Redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('대시보드');
    await expect(page.locator('h2:has-text("환영합니다")')).toBeVisible();

    // Verify dashboard elements
    await expect(page.locator('text=오늘의 근무 현황')).toBeVisible();
    await expect(page.locator('text=이번 주 인건비')).toBeVisible();
    await expect(page.locator('button:has-text("직원 초대하기")')).toBeVisible();
  });

  test('[UX-1.1-Error] Signup with invalid data shows errors', async ({ page }) => {
    await page.goto('/auth/signup');

    // Try to submit with empty fields
    await page.click('button[type="submit"]');

    // Check for validation errors
    await expect(page.locator('text=올바른 이메일 주소를 입력하세요')).toBeVisible();
    await expect(page.locator('text=비밀번호는 최소 8자 이상이어야 합니다')).toBeVisible();

    // Fill with invalid email
    await page.fill('#email', 'invalid-email');
    await page.fill('#password', 'short');
    await page.fill('#confirmPassword', 'different');
    await page.fill('#name', '테스트');
    await page.fill('#phone', '010-1234-5678');
    await page.fill('#storeName', '테스트카페');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=올바른 이메일 주소를 입력하세요')).toBeVisible();
    await expect(page.locator('text=비밀번호는 최소 8자 이상이어야 합니다')).toBeVisible();
    await expect(page.locator('text=비밀번호가 일치하지 않습니다')).toBeVisible();
  });

  test('[UX-1.1-Error] Signup with existing email shows error', async ({ page }) => {
    // First, create an account
    await page.goto('/auth/signup');

    const timestamp = Date.now();
    const testEmail = `duplicate${timestamp}@test.com`;

    await page.fill('#email', testEmail);
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');
    await page.fill('#name', '테스트점주');
    await page.fill('#phone', '010-1234-5678');
    await page.fill('#storeName', '테스트카페');
    await page.selectOption('#storeType', 'CAFE');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/auth\/login/);

    // Try to signup again with the same email
    await page.goto('/auth/signup');

    await page.fill('#email', testEmail);
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');
    await page.fill('#name', '테스트점주2');
    await page.fill('#phone', '010-1234-5679');
    await page.fill('#storeName', '테스트카페2');
    await page.selectOption('#storeType', 'CAFE');

    await page.click('button[type="submit"]');

    // Check for duplicate email error
    await expect(page.locator('text=이미 사용 중인 이메일입니다')).toBeVisible();
  });

  test('[UX-1.1-Login] Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('#email', 'nonexistent@test.com');
    await page.fill('#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
  });

  test('[UX-1.1-Nav] Navigation between signup and login pages', async ({ page }) => {
    await page.goto('/auth/login');

    // Click signup link
    await page.click('text=계정이 없으신가요? 회원가입');
    await expect(page).toHaveURL('/auth/signup');

    // Click login link
    await page.click('text=이미 계정이 있으신가요? 로그인');
    await expect(page).toHaveURL('/auth/login');
  });

  test('[UX-1.1-Logout] Logout clears cookies and redirects', async ({ page }) => {
    // First, create account and login
    await page.goto('/auth/signup');

    const timestamp = Date.now();
    const testEmail = `logout${timestamp}@test.com`;

    await page.fill('#email', testEmail);
    await page.fill('#password', 'TestPass123!');
    await page.fill('#confirmPassword', 'TestPass123!');
    await page.fill('#name', '테스트점주');
    await page.fill('#phone', '010-1234-5678');
    await page.fill('#storeName', '테스트카페');
    await page.selectOption('#storeType', 'CAFE');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.fill('#email', testEmail);
    await page.fill('#password', 'TestPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Click logout button
    await page.click('text=로그아웃');
    await expect(page).toHaveURL('/auth/login');

    // Verify cannot access dashboard without login
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth/login');
  });

  test('[UX-1.1-Protected] Dashboard is protected, redirects to login', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
  });
});
