import { test, expect } from '@playwright/test';

test.describe('Split Panel功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('應該顯示分割面板結構', async ({ page }) => {
    // 檢查分割面板容器存在
    await expect(page.getByTestId('split-panel-container')).toBeVisible();
    
    // 檢查左右面板都存在
    await expect(page.getByTestId('split-panel-left')).toBeVisible();
    await expect(page.getByTestId('split-panel-right')).toBeVisible();
    
    // 檢查分隔線存在（桌面版）
    await expect(page.getByTestId('split-panel-separator')).toBeVisible();
  });

  test('應該包含編輯器和預覽區域', async ({ page }) => {
    // 檢查編輯器標題
    await expect(page.getByText('Markdown 編輯器')).toBeVisible();
    
    // 檢查預覽區域標題 (使用更精確的選擇器)
    await expect(page.getByRole('heading', { name: '預覽' })).toBeVisible();
    
    // 檢查markdown編輯器存在
    await expect(page.getByTestId('markdown-editor')).toBeVisible();
    
    // 檢查預覽區域存在
    await expect(page.getByTestId('preview')).toBeVisible();
  });

  test('應該可以拖拉調整面板大小', async ({ page }) => {
    // 確保在桌面尺寸
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const separator = page.getByTestId('split-panel-separator');
    const leftPanel = page.getByTestId('split-panel-left');
    
    // 獲取初始寬度
    const initialLeftWidth = await leftPanel.evaluate(el => el.getBoundingClientRect().width);
    
    // 拖拉分隔線向右移動100px
    await separator.hover();
    await page.mouse.down();
    await page.mouse.move(100, 0, { steps: 10 });
    await page.mouse.up();
    
    // 等待一下讓變更生效
    await page.waitForTimeout(100);
    
    // 檢查左面板寬度有改變
    const newLeftWidth = await leftPanel.evaluate(el => el.getBoundingClientRect().width);
    expect(newLeftWidth).not.toBe(initialLeftWidth);
  });

  test('應該在行動裝置上切換為垂直佈局', async ({ page }) => {
    // 設置行動裝置尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    
    const container = page.getByTestId('split-panel-container');
    
    // 檢查容器有正確的響應式class
    await expect(container).toHaveClass(/flex-col/);
    
    // 分隔線在行動裝置上應該隱藏
    const separator = page.getByTestId('split-panel-separator');
    await expect(separator).not.toBeVisible();
  });

  test('應該保持最小寬度限制', async ({ page }) => {
    // 確保在桌面尺寸
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const separator = page.getByTestId('split-panel-separator');
    const leftPanel = page.getByTestId('split-panel-left');
    
    // 嘗試拖拉到非常小的位置
    await separator.hover();
    await page.mouse.down();
    await page.mouse.move(-500, 0, { steps: 10 }); // 向左拖拉很多
    await page.mouse.up();
    
    await page.waitForTimeout(100);
    
    // 檢查左面板沒有小於最小寬度（300px）
    const leftWidth = await leftPanel.evaluate(el => el.getBoundingClientRect().width);
    expect(leftWidth).toBeGreaterThanOrEqual(299); // 允許1px誤差
  });

  test('應該顯示拖拉視覺回饋', async ({ page }) => {
    // 確保在桌面尺寸
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const separator = page.getByTestId('split-panel-separator');
    
    // 檢查分隔線有hover效果
    await separator.hover();
    
    // 開始拖拉
    await page.mouse.down();
    
    // 檢查拖拉時的視覺狀態
    await expect(separator).toHaveClass(/bg-blue-500/);
    
    await page.mouse.up();
  });

  test('面板大小設定應該持久化', async ({ page }) => {
    // 確保在桌面尺寸
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const separator = page.getByTestId('split-panel-separator');
    const leftPanel = page.getByTestId('split-panel-left');
    
    // 調整面板大小
    await separator.hover();
    await page.mouse.down();
    await page.mouse.move(150, 0, { steps: 5 });
    await page.mouse.up();
    
    await page.waitForTimeout(100);
    
    // 記錄調整後的寬度
    const adjustedWidth = await leftPanel.evaluate(el => el.getBoundingClientRect().width);
    
    // 重新整理頁面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 檢查寬度是否保持
    const persistedWidth = await leftPanel.evaluate(el => el.getBoundingClientRect().width);
    
    // 允許小幅誤差（localStorage可能有精度差異）
    expect(Math.abs(persistedWidth - adjustedWidth)).toBeLessThan(5);
  });

  test('應該正確處理window resize', async ({ page }) => {
    // 開始時設置大螢幕
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // 檢查是水平佈局
    const container = page.getByTestId('split-panel-container');
    await expect(container).toHaveClass(/lg:flex-row/);
    
    // 調整到小螢幕
    await page.setViewportSize({ width: 768, height: 600 });
    
    // 等待響應式變化
    await page.waitForTimeout(100);
    
    // 檢查變為垂直佈局
    const separator = page.getByTestId('split-panel-separator');
    await expect(separator).not.toBeVisible();
  });

  test('編輯器和預覽功能應該正常工作', async ({ page }) => {
    const editor = page.getByTestId('editor-textarea');
    const preview = page.getByTestId('preview');
    
    // 檢查編輯器有預設內容
    const editorContent = await editor.inputValue();
    expect(editorContent).toContain('歡迎使用 Markdown 投影片產生器');
    
    // 檢查預覽區域顯示內容
    await expect(preview.getByText('歡迎使用 Markdown 投影片產生器')).toBeVisible();
    
    // 檢查控制按鈕存在
    await expect(page.getByTestId('prev-slide')).toBeVisible();
    await expect(page.getByTestId('next-slide')).toBeVisible();
    await expect(page.getByTestId('slide-counter')).toBeVisible();
  });
});