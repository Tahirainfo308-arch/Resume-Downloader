import { expect, test } from '@playwright/test';

test('design system renders and behaves across responsive widths', async ({ page }) => {
  await page.goto('/design-system');
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

  await expect(page.getByRole('heading', { name: 'Design System', level: 1 })).toBeVisible();
  await expect(
    page.getByText('Reusable primitives, layouts, and interaction patterns'),
  ).toBeVisible();

  const hasNoHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(hasNoHorizontalOverflow).toBe(true);

  const viewport = page.viewportSize();
  const width = viewport?.width ?? 0;
  const primaryNav = page.getByRole('navigation', { name: 'Primary' });
  const desktopSidebar = page.locator('aside').first();

  if (width < 768) {
    await expect(primaryNav).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
    await page.getByRole('button', { name: 'Close navigation menu' }).click();
  } else {
    await expect(primaryNav).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeHidden();
  }

  if (width >= 1024) {
    await expect(desktopSidebar).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open sidebar' })).toBeHidden();
  } else {
    await expect(desktopSidebar).toBeHidden();
    await page.getByRole('button', { name: 'Open sidebar' }).click();
    await expect(page.getByRole('dialog', { name: 'Design System' })).toBeVisible();
    await page.getByRole('button', { name: 'Close drawer' }).click();
  }

  await page.getByRole('button', { name: 'Open modal' }).click();
  const modal = page.getByRole('dialog', { name: 'Design system modal' });
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();

  await page.getByRole('button', { name: 'Actions' }).click();
  await page.getByRole('menuitem', { name: 'Rename document' }).click();
  await expect(page.getByText('Selected: Rename document')).toBeVisible();

  await page.getByRole('button', { name: 'Success toast' }).click();
  await expect(page.getByText('Changes saved')).toBeVisible();

  await page.getByRole('tab', { name: 'Activity' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Activity would be populated');

  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText('Page 3 of 12')).toBeVisible();

  await page.getByLabel('Email address').fill('invalid');
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm action' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Discard changes?' });
  await expect(confirmation).toBeVisible();
  await page.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(confirmation).toBeHidden();
});
