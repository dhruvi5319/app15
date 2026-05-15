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

// Creates a new wine and navigates to its detail page, returns the wine name
async function createWineAndOpenDetail(
  page: import('@playwright/test').Page,
  suffix: string = ''
): Promise<string> {
  const wineName = `Lifecycle Test Wine ${suffix || Date.now()}`;
  await page.goto('/wines/add');
  await page.getByLabel(/wine name/i).fill(wineName);
  await page.getByRole('button', { name: /add wine/i }).click();
  await page.waitForURL(/\/wines\/[0-9a-f-]+$/);
  return wineName;
}

test.describe('Wine Lifecycle — status transitions', () => {
  test('mark active wine as consumed from detail page', async ({ page }) => {
    await loginUser(page);
    const wineName = await createWineAndOpenDetail(page, 'mark-consumed');

    // Detail page should show "Mark as Consumed" button (wine is active)
    const consumeBtn = page.getByRole('button', { name: /mark as consumed/i });
    await expect(consumeBtn).toBeVisible();

    // Click it
    await consumeBtn.click();

    // Status badge should update to "consumed"
    await expect(page.getByText('consumed')).toBeVisible();

    // "Mark as Consumed" button gone; "Revert to Active" appears
    await expect(consumeBtn).not.toBeVisible();
    await expect(page.getByRole('button', { name: /revert to active/i })).toBeVisible();

    // Cleanup: revert so other tests aren't affected
    await page.getByRole('button', { name: /revert to active/i }).click();
    await expect(page.getByRole('button', { name: /mark as consumed/i })).toBeVisible();
  });

  test('consumed wine disappears from active inventory list', async ({ page }) => {
    await loginUser(page);
    const wineName = await createWineAndOpenDetail(page, 'disappear-test');

    // Mark as consumed
    await page.getByRole('button', { name: /mark as consumed/i }).click();
    await expect(page.getByRole('button', { name: /revert to active/i })).toBeVisible();

    // Go back to active inventory list
    await page.goto('/');
    // The wine should not appear in the default active list
    // (status defaults to 'active' filter)
    await expect(page.getByText(wineName)).not.toBeVisible();

    // Navigate to history page to verify it's there
    await page.goto('/history');
    await expect(page.getByText(wineName)).toBeVisible();
  });

  test('consumed wine appears in history page under Consumed tab', async ({ page }) => {
    await loginUser(page);
    const wineName = await createWineAndOpenDetail(page, 'history-test');

    // Mark as consumed
    await page.getByRole('button', { name: /mark as consumed/i }).click();
    await expect(page.getByRole('button', { name: /revert to active/i })).toBeVisible();

    // Navigate to /history
    await page.goto('/history');

    // History page should show Consumed tab (default)
    await expect(page.getByRole('button', { name: /^consumed$/i })).toBeVisible();

    // Wine should appear in the list
    await expect(page.getByText(wineName)).toBeVisible();
  });

  test('revert consumed wine back to active from detail page', async ({ page }) => {
    await loginUser(page);
    const wineName = await createWineAndOpenDetail(page, 'revert-test');

    // Mark as consumed first
    await page.getByRole('button', { name: /mark as consumed/i }).click();
    await expect(page.getByRole('button', { name: /revert to active/i })).toBeVisible();

    // Revert to active
    await page.getByRole('button', { name: /revert to active/i }).click();

    // Status badge should show "active"
    await expect(page.getByText('active')).toBeVisible();

    // Buttons should be back to active state
    await expect(page.getByRole('button', { name: /mark as consumed/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /revert to active/i })).not.toBeVisible();

    // Wine should be back in active inventory
    await page.goto('/');
    await expect(page.getByText(wineName)).toBeVisible();
  });

  test('mark active wine as removed', async ({ page }) => {
    await loginUser(page);
    const wineName = await createWineAndOpenDetail(page, 'removed-test');

    // Detail page shows "Mark as Removed" button
    await expect(page.getByRole('button', { name: /mark as removed/i })).toBeVisible();

    // Click it
    await page.getByRole('button', { name: /mark as removed/i }).click();

    // Status badge updates
    await expect(page.getByText('removed')).toBeVisible();

    // "Revert to Active" appears
    await expect(page.getByRole('button', { name: /revert to active/i })).toBeVisible();

    // Check it appears in Removed tab on history page
    await page.goto('/history');
    await page.getByRole('button', { name: /^removed$/i }).click();
    await expect(page.getByText(wineName)).toBeVisible();
  });

  test('history page Consumed/Removed tabs switch content', async ({ page }) => {
    await loginUser(page);
    await page.goto('/history');

    // Default tab is Consumed
    await expect(page.getByRole('button', { name: /^consumed$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^removed$/i })).toBeVisible();

    // Clicking Removed tab changes the view (no crash, label changes)
    await page.getByRole('button', { name: /^removed$/i }).click();
    // Page should still be /history and not error
    await expect(page.getByRole('heading', { name: /wine history/i })).toBeVisible();
  });
});
