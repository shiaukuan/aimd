// ABOUTME: E2E tests for layout refactoring using MainLayout and Header components
// ABOUTME: Tests responsive design, semantic HTML structure and accessibility of new layout

import { test, expect } from '@playwright/test';

test.describe('Layout Components - Header and MainLayout', () => {
  test('should render Header component with correct content', async ({
    page,
  }) => {
    await page.goto('/');

    // Check for header element with proper role
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check for main title in header
    const title = page.locator('header h1');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Markdown 投影片產生器');

    // Check for description
    const description = page.locator('header p');
    await expect(description).toBeVisible();
    await expect(description).toHaveText('使用 Markdown 輕鬆創建專業投影片');
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for main landmarks
    const header = page.locator('header');
    const main = page.locator('main');

    await expect(header).toBeVisible();
    await expect(main).toBeVisible();

    // Check DOM order - header should come before main
    const headerPosition = await header.evaluate(el => {
      let position = 0;
      let current = el;
      while (current.previousElementSibling) {
        position++;
        current = current.previousElementSibling;
      }
      return position;
    });

    const mainPosition = await main.evaluate(el => {
      let position = 0;
      let current = el;
      while (current.previousElementSibling) {
        position++;
        current = current.previousElementSibling;
      }
      return position;
    });

    expect(headerPosition).toBeLessThan(mainPosition);
  });

  test('should be responsive across different screen sizes', async ({
    page,
  }) => {
    // Test desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    let header = page.locator('header');
    await expect(header).toBeVisible();

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(header).toBeVisible();

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(header).toBeVisible();

    // Ensure no horizontal scroll on mobile
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('should have accessible header with proper ARIA structure', async ({
    page,
  }) => {
    await page.goto('/');

    // Header should be accessible
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // H1 should be the main heading in header
    const h1 = page.locator('header h1');
    await expect(h1).toBeVisible();

    // The header h1 should be the main heading
    await expect(h1).toHaveText('Markdown 投影片產生器');
  });

  test('should maintain visual consistency', async ({ page }) => {
    await page.goto('/');

    // Check that header has border-b styling
    const header = page.locator('header');
    const headerStyles = await header.evaluate(el =>
      window.getComputedStyle(el)
    );

    // Should have some form of border or visual separation
    expect(headerStyles.borderBottomWidth).not.toBe('0px');

    // Check container padding
    const container = page.locator('header > div');
    const containerStyles = await container.evaluate(el =>
      window.getComputedStyle(el)
    );

    // Should have proper padding
    expect(containerStyles.paddingLeft).not.toBe('0px');
    expect(containerStyles.paddingRight).not.toBe('0px');
  });

  test('should handle keyboard navigation properly', async ({ page }) => {
    await page.goto('/');

    // Start keyboard navigation
    await page.keyboard.press('Tab');

    // Should be able to navigate through interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing and ensure we can reach the main content
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const newFocusedElement = page.locator(':focus');
    await expect(newFocusedElement).toBeVisible();
  });
});
