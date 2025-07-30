import { test, expect } from '@playwright/test';

test.describe('編輯器功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('應該顯示完整的編輯器界面', async ({ page }) => {
    // 檢查編輯器面板存在
    await expect(page.getByTestId('editor-panel')).toBeVisible();

    // 檢查工具列存在
    await expect(page.getByTestId('editor-toolbar')).toBeVisible();

    // 檢查編輯區域存在
    await expect(page.getByTestId('editor-textarea')).toBeVisible();

    // 檢查狀態列存在
    await expect(page.getByTestId('editor-status-bar')).toBeVisible();
  });

  test('工具列應該包含所有必要按鈕', async ({ page }) => {
    // 檔案操作按鈕
    await expect(page.getByTestId('toolbar-new')).toBeVisible();
    await expect(page.getByTestId('toolbar-save')).toBeVisible();
    await expect(page.getByTestId('toolbar-export')).toBeVisible();

    // 格式化按鈕
    await expect(page.getByTestId('toolbar-bold')).toBeVisible();
    await expect(page.getByTestId('toolbar-italic')).toBeVisible();
    await expect(page.getByTestId('toolbar-code')).toBeVisible();

    // 標題按鈕
    await expect(page.getByTestId('toolbar-heading1')).toBeVisible();
    await expect(page.getByTestId('toolbar-heading2')).toBeVisible();
    await expect(page.getByTestId('toolbar-heading3')).toBeVisible();

    // 清單按鈕
    await expect(page.getByTestId('toolbar-bulletList')).toBeVisible();
    await expect(page.getByTestId('toolbar-numberedList')).toBeVisible();

    // 插入按鈕
    await expect(page.getByTestId('toolbar-link')).toBeVisible();
    await expect(page.getByTestId('toolbar-image')).toBeVisible();
    await expect(page.getByTestId('toolbar-codeBlock')).toBeVisible();

    // 設定按鈕
    await expect(page.getByTestId('toolbar-settings')).toBeVisible();
  });

  test('應該顯示預設內容', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');
    const content = await textarea.inputValue();

    expect(content).toContain('歡迎使用 Markdown 投影片產生器');
    expect(content).toContain('功能特色');
    expect(content).toContain('即時預覽');
  });

  test('應該能夠編輯文字內容', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 清空內容並輸入新文字
    await textarea.fill('');
    await textarea.fill('# 新的標題\n\n這是新的內容');

    // 驗證內容已更新
    const content = await textarea.inputValue();
    expect(content).toBe('# 新的標題\n\n這是新的內容');
  });

  test('狀態列應該顯示正確的統計資訊', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 輸入已知內容
    await textarea.fill('Hello World\nSecond line');

    // 等待統計更新
    await page.waitForTimeout(100);

    // 檢查統計資訊
    await expect(page.getByTestId('stats-words')).toContainText('3 字');
    await expect(page.getByTestId('stats-characters')).toContainText('23 字元');
    await expect(page.getByTestId('stats-lines-total')).toContainText('2 行');
  });

  test('應該顯示游標位置', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 將游標移動到特定位置
    await textarea.click();
    await textarea.press('End'); // 移動到行尾

    // 檢查游標位置顯示
    await expect(page.getByTestId('stats-lines')).toContainText('第 1 行');
    await expect(page.getByTestId('stats-column')).toBeVisible();
  });

  test('粗體按鈕應該正常工作', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 清空並選取文字
    await textarea.fill('test content');
    await textarea.selectText();
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight'); // 選取 "test"

    // 點擊粗體按鈕
    await page.getByTestId('toolbar-bold').click();

    // 檢查內容是否變為粗體格式
    const content = await textarea.inputValue();
    expect(content).toBe('**test** content');
  });

  test('斜體按鈕應該正常工作', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    await textarea.fill('test content');
    await textarea.selectText();
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight'); // 選取 "test"

    // 點擊斜體按鈕
    await page.getByTestId('toolbar-italic').click();

    const content = await textarea.inputValue();
    expect(content).toBe('*test* content');
  });

  test('標題按鈕應該正常工作', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    await textarea.fill('heading');
    await textarea.selectText();

    // 點擊 H1 按鈕
    await page.getByTestId('toolbar-heading1').click();

    const content = await textarea.inputValue();
    expect(content).toBe('# heading');
  });

  test('清單按鈕應該正常工作', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    await textarea.fill('item');
    await textarea.selectText();

    // 點擊項目清單按鈕
    await page.getByTestId('toolbar-bulletList').click();

    const content = await textarea.inputValue();
    expect(content).toBe('- item');
  });

  test('應該支援鍵盤快捷鍵', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    await textarea.fill('test');
    await textarea.selectText();

    // 使用 Ctrl+B 快捷鍵
    await page.keyboard.press('Control+b');

    const content = await textarea.inputValue();
    expect(content).toBe('**test**');
  });

  test('儲存功能應該更新狀態', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 修改內容
    await textarea.fill('modified content');

    // 應該顯示修改指示器
    await expect(page.getByTestId('modified-indicator')).toBeVisible();

    // 點擊儲存按鈕
    await page.getByTestId('toolbar-save').click();

    // 修改指示器應該消失
    await expect(page.getByTestId('modified-indicator')).not.toBeVisible();

    // 狀態應該顯示已儲存
    await expect(page.getByTestId('save-status')).toContainText('剛剛儲存');
  });

  test('應該顯示選取文字的統計', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    await textarea.fill('Hello World Test');

    // 選取部分文字
    await textarea.click();
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight'); // 選取 "Hello"

    // 應該顯示選取統計
    await expect(page.getByTestId('stats-selected')).toContainText('5 字元');
    await expect(page.getByText('已選取:')).toBeVisible();
  });

  test('工具列按鈕應該有 hover 效果', async ({ page }) => {
    const boldButton = page.getByTestId('toolbar-bold');

    // 檢查按鈕初始狀態
    await expect(boldButton).toBeVisible();

    // Hover 按鈕
    await boldButton.hover();

    // 檢查 tooltip
    await expect(boldButton).toHaveAttribute('title', '粗體 (Ctrl+B)');
  });

  test('應該在手機尺寸下正常顯示', async ({ page }) => {
    // 設定手機螢幕尺寸
    await page.setViewportSize({ width: 375, height: 667 });

    // 編輯器應該仍然可見
    await expect(page.getByTestId('editor-panel')).toBeVisible();
    await expect(page.getByTestId('editor-toolbar')).toBeVisible();
    await expect(page.getByTestId('editor-textarea')).toBeVisible();

    // 工具列按鈕應該隱藏文字標籤（只顯示圖示）
    const boldButton = page.getByTestId('toolbar-bold');
    await expect(boldButton).toBeVisible();
  });

  test('連結插入功能應該正常工作', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    await textarea.fill('click here');
    await textarea.selectText();
    await page.keyboard.press('Home');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+ArrowRight');
    } // 選取 "click"

    // 點擊連結按鈕
    await page.getByTestId('toolbar-link').click();

    const content = await textarea.inputValue();
    expect(content).toBe('[click](url) here');
  });

  test('應該正確處理多行文字的游標位置', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    await textarea.fill('第一行\n第二行\n第三行');

    // 將游標移動到第二行
    await textarea.click();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    // 檢查游標位置顯示
    await expect(page.getByTestId('stats-lines')).toContainText('第 2 行');
    await expect(page.getByTestId('stats-column')).toContainText('第 3 列');
  });
});
