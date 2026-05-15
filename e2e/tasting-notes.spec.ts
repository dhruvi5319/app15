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

// Navigate to a wine detail page — creates one first if none exist
async function navigateToWineDetail(page: import('@playwright/test').Page) {
  await page.goto('/');
  const wineLinks = page
    .locator('a[href^="/wines/"]')
    .filter({ hasNot: page.locator('[href="/wines/add"]') });

  if ((await wineLinks.count()) === 0) {
    // Create a test wine to work with
    await page.goto('/wines/add');
    await page.getByLabel(/wine name/i).fill(`E2E Tasting Notes Wine ${Date.now()}`);
    await page.getByRole('button', { name: /add wine/i }).click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);
  } else {
    await wineLinks.first().click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);
  }
}

test.describe('Tasting Notes — inline editor', () => {
  test('add tasting note from detail page', async ({ page }) => {
    await loginUser(page);
    await navigateToWineDetail(page);

    // Should show "No tasting notes yet." and "Add notes" button when no note exists
    // (Also works if a prior test left a note — "Edit" button handles that)
    const addBtn = page.getByRole('button', { name: /add notes/i });
    const editBtn = page.getByRole('button', { name: /^edit$/i });

    const hasNote = await editBtn.isVisible().catch(() => false);
    if (!hasNote) {
      await expect(addBtn).toBeVisible();
      await expect(page.getByText(/no tasting notes yet/i)).toBeVisible();

      // Click Add notes
      await addBtn.click();

      // Textarea should appear
      const textarea = page.getByLabel(/tasting notes/i);
      await expect(textarea).toBeVisible();

      // Type a note
      await textarea.fill('Dark cherry with hints of oak and vanilla');

      // Save
      await page.getByRole('button', { name: /^save$/i }).click();

      // Note should be displayed immediately (React Query cache update)
      await expect(page.getByText('Dark cherry with hints of oak and vanilla')).toBeVisible();

      // Textarea should be gone
      await expect(textarea).not.toBeVisible();

      // Edit button should now be visible
      await expect(page.getByRole('button', { name: /^edit$/i })).toBeVisible();
    }
  });

  test('edit existing tasting note', async ({ page }) => {
    await loginUser(page);

    // Create a wine with a known tasting note via the add form
    await page.goto('/wines/add');
    const wineNameForEdit = `E2E Edit Notes ${Date.now()}`;
    await page.getByLabel(/wine name/i).fill(wineNameForEdit);
    await page.getByRole('button', { name: /add wine/i }).click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);

    // Add a note first using the inline editor
    await page.getByRole('button', { name: /add notes/i }).click();
    const textarea = page.getByLabel(/tasting notes/i);
    await textarea.fill('Initial note text');
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(page.getByText('Initial note text')).toBeVisible();

    // Now edit it
    await page.getByRole('button', { name: /^edit$/i }).click();
    await expect(page.getByLabel(/tasting notes/i)).toBeVisible();

    // Modify the text
    const editTextarea = page.getByLabel(/tasting notes/i);
    await editTextarea.clear();
    await editTextarea.fill('Updated note with more nuance');

    await page.getByRole('button', { name: /^save$/i }).click();

    // Updated text shown, old text gone
    await expect(page.getByText('Updated note with more nuance')).toBeVisible();
    await expect(page.getByText('Initial note text')).not.toBeVisible();

    // Textarea closed
    await expect(editTextarea).not.toBeVisible();
  });

  test('clear tasting note', async ({ page }) => {
    await loginUser(page);

    // Create a wine and set a note
    await page.goto('/wines/add');
    const wineNameForClear = `E2E Clear Notes ${Date.now()}`;
    await page.getByLabel(/wine name/i).fill(wineNameForClear);
    await page.getByRole('button', { name: /add wine/i }).click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);

    // Add note
    await page.getByRole('button', { name: /add notes/i }).click();
    const textarea = page.getByLabel(/tasting notes/i);
    await textarea.fill('A note to be cleared');
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(page.getByText('A note to be cleared')).toBeVisible();

    // Open editor and clear via "Clear notes" link
    await page.getByRole('button', { name: /^edit$/i }).click();

    const clearLink = page.getByRole('button', { name: /clear notes/i });
    await expect(clearLink).toBeVisible();
    await clearLink.click();

    // Textarea should now be empty
    await expect(page.getByLabel(/tasting notes/i)).toHaveValue('');

    // Save the cleared note
    await page.getByRole('button', { name: /^save$/i }).click();

    // Should show "No tasting notes yet." and "Add notes" button
    await expect(page.getByText(/no tasting notes yet/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add notes/i })).toBeVisible();
  });

  test('cancel editing restores original text', async ({ page }) => {
    await loginUser(page);

    // Create a wine and set a note
    await page.goto('/wines/add');
    const wineNameForCancel = `E2E Cancel Notes ${Date.now()}`;
    await page.getByLabel(/wine name/i).fill(wineNameForCancel);
    await page.getByRole('button', { name: /add wine/i }).click();
    await page.waitForURL(/\/wines\/[0-9a-f-]+$/);

    // Add note
    await page.getByRole('button', { name: /add notes/i }).click();
    const textarea = page.getByLabel(/tasting notes/i);
    await textarea.fill('Original note text');
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(page.getByText('Original note text')).toBeVisible();

    // Open editor, type something, then cancel
    await page.getByRole('button', { name: /^edit$/i }).click();
    const editTextarea = page.getByLabel(/tasting notes/i);
    await editTextarea.fill('This will be discarded');

    await page.getByRole('button', { name: /cancel/i }).click();

    // Original note still shown
    await expect(page.getByText('Original note text')).toBeVisible();
    await expect(page.getByText('This will be discarded')).not.toBeVisible();
    await expect(editTextarea).not.toBeVisible();
  });
});
