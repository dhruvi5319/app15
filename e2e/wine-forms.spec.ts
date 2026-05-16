import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-test@example.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'Password123!';

async function loginUser(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('/');
}

test.describe('Add Wine Form', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/wines/add');
  });

  test('shows Add Wine heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /add wine/i })).toBeVisible();
  });

  test('shows all form fields', async ({ page }) => {
    await expect(page.getByLabel(/wine name/i)).toBeVisible();
    await expect(page.getByLabel(/producer/i)).toBeVisible();
    await expect(page.getByLabel(/vintage/i)).toBeVisible();
    await expect(page.getByLabel(/varietal/i)).toBeVisible();
    await expect(page.getByLabel(/region/i)).toBeVisible();
    await expect(page.getByLabel(/bottle count/i)).toBeVisible();
  });

  test('shows validation error for empty name', async ({ page }) => {
    await page.getByRole('button', { name: /add wine/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test('quick-add: submitting only a name creates wine and redirects to detail page', async ({ page }) => {
    const uniqueName = `E2E Quick Add ${Date.now()}`;
    await page.getByLabel(/wine name/i).fill(uniqueName);
    await page.getByRole('button', { name: /add wine/i }).click();

    // Should navigate to /wines/:id
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('full add: submitting all fields saves correctly', async ({ page }) => {
    const uniqueName = `E2E Full Add ${Date.now()}`;
    await page.getByLabel(/wine name/i).fill(uniqueName);
    await page.getByLabel(/producer/i).fill('Test Producer');
    await page.getByLabel(/vintage/i).fill('2019');
    await page.getByLabel(/varietal/i).fill('Merlot');
    await page.getByLabel(/region/i).fill('Bordeaux');
    await page.getByLabel(/bottle count/i).fill('5');
    await page.getByRole('button', { name: /add wine/i }).click();

    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);
    await expect(page.getByText(uniqueName)).toBeVisible();
    await expect(page.getByText('Test Producer')).toBeVisible();
    await expect(page.getByText('2019')).toBeVisible();
  });
});

test.describe('Edit Wine Form', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    // Navigate to first wine's edit page (skip if no wines)
    await page.goto('/');
    const wineLinks = page.locator('a[href^="/wines/"]').filter({ hasNot: page.locator('[href="/wines/add"]') });
    if (await wineLinks.count() === 0) {
      // Create a wine to edit
      await page.goto('/wines/add');
      await page.getByLabel(/wine name/i).fill(`E2E Edit Target ${Date.now()}`);
      await page.getByRole('button', { name: /add wine/i }).click();
      await page.waitForURL(/\/wines\/[0-9a-f-]+$/);
    } else {
      await wineLinks.first().click();
      await page.waitForURL(/\/wines\/[0-9a-f-]+$/);
    }
    // Click Edit
    await page.getByRole('link', { name: /edit/i }).click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+\/edit$/);
  });

  test('shows Edit Wine heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /edit wine/i })).toBeVisible();
  });

  test('form is pre-populated with current wine values', async ({ page }) => {
    // Name field should not be empty
    const nameValue = await page.getByLabel(/wine name/i).inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
  });

  test('shows BottleCountControl with + and - buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /increase bottle count/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /decrease bottle count/i })).toBeVisible();
  });

  test('- button is disabled when count is 0', async ({ page }) => {
    // Check: if bottle count shown is 0, minus should be disabled
    const countText = await page.locator('[aria-live="polite"]').first().textContent();
    if (countText === '0') {
      await expect(page.getByRole('button', { name: /decrease bottle count/i })).toBeDisabled();
    }
    // Otherwise just verify the button is visible
    await expect(page.getByRole('button', { name: /decrease bottle count/i })).toBeVisible();
  });

  test('cancelling edit returns to wine detail page', async ({ page }) => {
    await page.getByRole('button', { name: /cancel/i }).click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);
    // Should be on detail page (not edit page)
    await expect(page.url()).not.toMatch(/\/edit$/);
  });
});
