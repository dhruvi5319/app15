import { test, expect } from '@playwright/test';

// Helpers — uses env vars with fallbacks matching Phase 1 e2e pattern
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-test@example.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'Password123!';

// Login helper: authenticate in the browser context
async function loginUser(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  // Wait for redirect to inventory
  await page.waitForURL('/');
}

test.describe('Inventory List Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('shows My Wine Cellar heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /my wine cellar/i })).toBeVisible();
  });

  test('shows Add Wine button linking to /wines/add', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /add wine/i });
    await expect(addButton).toBeVisible();
    await expect(addButton).toHaveAttribute('href', '/wines/add');
  });

  test('shows sort controls', async ({ page }) => {
    await expect(page.getByRole('button', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /date added/i })).toBeVisible();
  });

  test('shows empty state or wine list (no crash)', async ({ page }) => {
    // Either EmptyState or a list of wines should render — page should not crash
    const hasWines = await page.locator('a[href^="/wines/"]').count() > 0;
    if (!hasWines) {
      await expect(page.getByText(/your cellar is empty/i)).toBeVisible();
    }
  });

  test('shows status filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^active$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible();
  });
});

test.describe('Wine Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('clicking a wine card navigates to detail page', async ({ page }) => {
    // Only run if there are wines in the list
    const wineLinks = page.locator('a[href^="/wines/"]').filter({ hasNot: page.locator('[href="/wines/add"]') });
    const count = await wineLinks.count();
    if (count === 0) {
      test.skip();
      return;
    }
    const firstLink = wineLinks.first();
    const href = await firstLink.getAttribute('href');
    await firstLink.click();
    await page.waitForURL(href!);
    await expect(page.getByText(/back to inventory/i)).toBeVisible();
  });

  test('detail page shows Edit and Delete buttons', async ({ page }) => {
    const wineLinks = page.locator('a[href^="/wines/"]').filter({ hasNot: page.locator('[href="/wines/add"]') });
    if (await wineLinks.count() === 0) { test.skip(); return; }

    await wineLinks.first().click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);

    await expect(page.getByRole('link', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
  });

  test('delete button shows confirmation dialog', async ({ page }) => {
    const wineLinks = page.locator('a[href^="/wines/"]').filter({ hasNot: page.locator('[href="/wines/add"]') });
    if (await wineLinks.count() === 0) { test.skip(); return; }

    await wineLinks.first().click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);

    await page.getByRole('button', { name: /delete/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/this action cannot be undone/i)).toBeVisible();

    // Cancel dismisses dialog
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
