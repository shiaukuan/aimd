// ABOUTME: E2E 測試用於驗證捐款頁面的完整功能
// ABOUTME: 測試 QR Code 顯示、捐款連結和使用者互動流程

import { test, expect } from '@playwright/test';

test.describe('Price Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/price');
  });

  test('should display donation card with title', async ({ page }) => {
    const title = page.getByRole('heading', { name: '捐款支持' });
    await expect(title).toBeVisible();
  });

  test('should display card description', async ({ page }) => {
    const description = page.getByText('您的支持是我們持續改進的動力');
    await expect(description).toBeVisible();
  });

  test('should display QR code image', async ({ page }) => {
    const image = page.getByAltText('捐款 QR Code');
    await expect(image).toBeVisible();
  });

  test('should have QR code image with correct source', async ({ page }) => {
    const image = page.getByAltText('捐款 QR Code');
    const src = await image.getAttribute('src');
    expect(src).toContain('qrcode-donate');
  });

  test('should have clickable donation link', async ({ page }) => {
    const link = page.getByRole('link', { name: /前往捐款頁面/ });
    await expect(link).toBeVisible();
    await expect(link).toBeEnabled();
  });

  test('should have correct donation link href', async ({ page }) => {
    const link = page.getByRole('link', { name: /前往捐款頁面/ });
    await expect(link).toHaveAttribute('href', 'https://p.ecpay.com.tw/500617F');
  });

  test('should display thank you message', async ({ page }) => {
    const thankYouMessage = page.getByText('感謝 10 元捐款支持');
    await expect(thankYouMessage).toBeVisible();
  });

  test('should display additional support message', async ({ page }) => {
    const supportMessage = page.getByText('您的每一份心意都將用於改善產品體驗');
    await expect(supportMessage).toBeVisible();
  });

  test('should open donation link in new tab', async ({ page, context }) => {
    // 監聽新頁面開啟事件
    const pagePromise = context.waitForEvent('page');

    // 點擊捐款連結
    const link = page.getByRole('link', { name: /前往捐款頁面/ });
    await link.click();

    // 取得新開啟的頁面
    const newPage = await pagePromise;

    // 驗證新頁面的 URL
    await expect(newPage).toHaveURL(/ecpay\.com\.tw/);

    // 關閉新頁面
    await newPage.close();
  });

  test('should have proper layout and styling', async ({ page }) => {
    // 驗證卡片容器存在
    const card = page.locator('[class*="border"]').first();
    await expect(card).toBeVisible();

    // 驗證頁面置中對齊
    const container = page.locator('.container').first();
    await expect(container).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // 設定手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });

    // 驗證主要元素仍然可見
    await expect(page.getByRole('heading', { name: '捐款支持' })).toBeVisible();
    await expect(page.getByAltText('捐款 QR Code')).toBeVisible();
    await expect(page.getByRole('link', { name: /前往捐款頁面/ })).toBeVisible();

    // 驗證沒有水平捲軸
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test('should have accessible structure', async ({ page }) => {
    // 驗證頁面有 main 區域
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    // 驗證導航存在
    const nav = page.getByRole('navigation', { name: '主要導航' });
    await expect(nav).toBeVisible();
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/price');
    await page.waitForTimeout(2000);

    // 過濾掉已知的可接受錯誤
    const significantErrors = consoleErrors.filter(
      error =>
        !error.includes('favicon') &&
        !error.includes('sourcemap') &&
        !error.includes('500 (Internal Server Error)')
    );

    expect(significantErrors).toHaveLength(0);
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Markdown 投影片產生器/);
  });
});
