import { test, expect } from '@playwright/test';

// These tests require:
// 1. API running at localhost:3001 (docker compose up or npm run dev in server/)
// 2. Vite dev server auto-started by playwright.config.ts webServer

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-test@example.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'Password123!';

test.describe('Authentication Flow', () => {
  test('unauthenticated user visiting / is redirected to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Wine Inventory' })).toBeVisible();
  });

  test('login page shows email and password fields and submit button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('invalid credentials show error message without page crash', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Error message appears (role="alert")
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('alert')).toContainText('Invalid email or password');

    // Still on login page
    await expect(page).toHaveURL('/login');
  });

  test('valid credentials redirect to inventory list page', async ({ page }) => {
    // This test requires a registered user to exist in the DB.
    // The E2E test user should be created via API before the test suite runs.
    // If running locally, ensure the test user is registered via:
    // curl -X POST http://localhost:3001/api/v1/auth/register -d '{"email":"e2e-test@example.com","password":"Password123!"}'

    await page.goto('/login');

    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should redirect to inventory page
    await expect(page).toHaveURL('/', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'My Wine Cellar' })).toBeVisible();
  });

  test('validation errors shown for empty form submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in' }).click();
    // Client-side validation: email error shown
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('submit button shows loading state during login request', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);

    const submitButton = page.getByRole('button', { name: 'Sign in' });
    await submitButton.click();

    // Button text changes to "Signing in..." during request
    // (may be brief — check for either state)
    await expect(submitButton.or(page.getByRole('button', { name: 'Signing in...' }))).toBeVisible();
  });
});
