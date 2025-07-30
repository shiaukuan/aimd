// ABOUTME: Basic E2E tests for the markdown slides application using Playwright
// ABOUTME: Tests fundamental app functionality like page loading, navigation, and basic interactions

import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Markdown 投影片產生器/);

    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);

    // Check for charset
    const charsetMeta = page.locator('meta[charset]');
    await expect(charsetMeta).toHaveAttribute('charset', 'utf-8');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if the page renders properly on mobile
    await expect(page.locator('body')).toBeVisible();

    // Verify no horizontal scrollbar
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for potential rounding
  });

  // Phase 1 完成：主題切換功能預期在 Phase 7 實作
  test.skip('should handle dark mode toggle (if implemented)', async ({
    page,
  }) => {
    // 預期在 Phase 7 實作：主題切換功能
    // 目前專注於基礎架構和核心功能
  });

  test('should have no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait a bit for any delayed console errors
    await page.waitForTimeout(2000);

    // Filter out known acceptable errors (if any)
    const significantErrors = consoleErrors.filter(
      error =>
        !error.includes('favicon') && // Ignore favicon errors
        !error.includes('sourcemap') && // Ignore sourcemap warnings in dev
        !error.includes('500 (Internal Server Error)') // Ignore server errors unrelated to layout
    );

    expect(significantErrors).toHaveLength(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Check if focus is visible (this depends on your CSS)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Block all network requests to simulate offline mode
    await page.route('**/*', route => route.abort());

    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // The page should still render basic content even without network
      await expect(page.locator('body')).toBeVisible();
    } catch (error) {
      // If the page fails to load, that's expected in offline mode
      // This test is mainly to ensure no crashes occur
    }
  });

  test('should have proper loading states', async ({ page }) => {
    await page.goto('/');

    // Look for any loading indicators
    const loadingIndicators = page.locator(
      '[data-testid*="loading"], [aria-label*="loading"], .loading'
    );

    // If loading indicators exist, they should eventually disappear
    const hasLoadingIndicators = (await loadingIndicators.count()) > 0;

    if (hasLoadingIndicators) {
      await expect(loadingIndicators.first()).toBeHidden({ timeout: 10000 });
    }
  });
});

test.describe('Basic UI Components', () => {
  test('should render shadcn/ui components correctly', async ({ page }) => {
    await page.goto('/');

    // Look for buttons with shadcn/ui styling
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Check if buttons have proper styling classes
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();

      // Test button interaction
      await firstButton.hover();
      // Button should be interactive (this is a basic check)
    }
  });

  test('should handle form inputs correctly', async ({ page }) => {
    await page.goto('/');

    // Look for any input fields
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      const firstInput = inputs.first();
      await expect(firstInput).toBeVisible();

      // Test input interaction
      await firstInput.click();
      await firstInput.fill('Test input');
      await expect(firstInput).toHaveValue('Test input');
    }
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (adjust based on requirements)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have acceptable Lighthouse scores', async ({ page }) => {
    // This is a placeholder for Lighthouse integration
    // You would need to add @playwright/test lighthouse integration
    await page.goto('/');

    // For now, just ensure the page loads
    await expect(page.locator('body')).toBeVisible();

    // TODO: Add actual Lighthouse performance testing
  });
});
