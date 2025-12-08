// ABOUTME: E2E 測試用於驗證頁面間導航功能
// ABOUTME: 測試首頁與捐款頁面的導航連結和路由行為

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate from home to price page', async ({ page }) => {
    await page.goto('/');

    // 點擊捐款支持連結
    await page.getByRole('link', { name: '捐款支持' }).click();

    // 驗證 URL 已切換到 /price
    await expect(page).toHaveURL('/price');

    // 驗證頁面內容已載入
    await expect(page.getByRole('heading', { name: '捐款支持' })).toBeVisible();
  });

  test('should navigate from price to home page', async ({ page }) => {
    await page.goto('/price');

    // 點擊首頁連結
    await page.getByRole('link', { name: '首頁' }).click();

    // 驗證 URL 已切換回 /
    await expect(page).toHaveURL('/');

    // 驗證首頁內容已載入
    await expect(page.getByRole('heading', { name: 'Markdown 投影片產生器' })).toBeVisible();
  });

  test('should highlight current page in navigation (home)', async ({ page }) => {
    await page.goto('/');

    const homeLink = page.getByRole('link', { name: '首頁' });
    const priceLink = page.getByRole('link', { name: '捐款支持' });

    // 驗證首頁連結有高亮樣式
    await expect(homeLink).toHaveClass(/text-primary/);
    await expect(homeLink).toHaveClass(/font-semibold/);

    // 驗證捐款頁面連結沒有高亮樣式
    await expect(priceLink).toHaveClass(/text-muted-foreground/);
  });

  test('should highlight current page in navigation (price)', async ({ page }) => {
    await page.goto('/price');

    const homeLink = page.getByRole('link', { name: '首頁' });
    const priceLink = page.getByRole('link', { name: '捐款支持' });

    // 驗證捐款頁面連結有高亮樣式
    await expect(priceLink).toHaveClass(/text-primary/);
    await expect(priceLink).toHaveClass(/font-semibold/);

    // 驗證首頁連結沒有高亮樣式
    await expect(homeLink).toHaveClass(/text-muted-foreground/);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    // 驗證導航區域存在且有正確的 ARIA 標籤
    const nav = page.getByRole('navigation', { name: '主要導航' });
    await expect(nav).toBeVisible();

    // 驗證導航連結可以被鍵盤存取
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should preserve navigation on page refresh', async ({ page }) => {
    await page.goto('/price');

    // 重新載入頁面
    await page.reload();

    // 驗證仍然在 /price 頁面
    await expect(page).toHaveURL('/price');
    await expect(page.getByRole('heading', { name: '捐款支持' })).toBeVisible();

    // 驗證導航高亮仍然正確
    const priceLink = page.getByRole('link', { name: '捐款支持' });
    await expect(priceLink).toHaveClass(/text-primary/);
  });

  test('should handle direct navigation to price page', async ({ page }) => {
    // 直接導航到 /price
    await page.goto('/price');

    // 驗證頁面正確載入
    await expect(page).toHaveURL('/price');
    await expect(page.getByRole('heading', { name: '捐款支持' })).toBeVisible();

    // 驗證導航連結存在
    await expect(page.getByRole('link', { name: '首頁' })).toBeVisible();
    await expect(page.getByRole('link', { name: '捐款支持' })).toBeVisible();
  });
});
