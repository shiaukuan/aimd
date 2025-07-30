import { test, expect } from '@playwright/test';

test.describe('Markdown 編輯器語法高亮功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('應該顯示語法高亮編輯器', async ({ page }) => {
    // 檢查 Markdown 編輯器存在
    await expect(page.getByTestId('markdown-editor')).toBeVisible();

    // 檢查行號顯示
    await expect(page.getByTestId('line-numbers')).toBeVisible();

    // 檢查編輯區域存在
    await expect(page.getByTestId('editor-textarea')).toBeVisible();
  });

  test('行號應該正確顯示', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 輸入多行內容
    await textarea.fill('第一行\n第二行\n第三行\n第四行');

    // 檢查行號顯示
    const lineNumbers = page.getByTestId('line-numbers');
    await expect(lineNumbers).toContainText('1');
    await expect(lineNumbers).toContainText('2');
    await expect(lineNumbers).toContainText('3');
    await expect(lineNumbers).toContainText('4');
  });

  test('應該支援 Tab 鍵縮排', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 清空編輯器內容，然後填入測試內容
    await textarea.selectText();
    await textarea.fill('test content');

    // 將游標移到行首
    await textarea.click();
    await page.keyboard.press('Home');

    // 按 Tab 鍵
    await page.keyboard.press('Tab');

    // 檢查內容是否添加了縮排
    const content = await textarea.inputValue();
    expect(content).toBe('  test content');
  });

  test('應該支援 Shift+Tab 移除縮排', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 輸入已縮排的內容
    await textarea.fill('  test content');

    // 將游標移到行首
    await textarea.click();
    await page.keyboard.press('Home');

    // 按 Shift+Tab
    await page.keyboard.press('Shift+Tab');

    // 檢查縮排是否被移除
    const content = await textarea.inputValue();
    expect(content).toBe('test content');
  });

  test('行號和內容應該同步捲動', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 生成足夠多的行數以產生捲軸
    const lines = Array.from({ length: 50 }, (_, i) => `第 ${i + 1} 行內容`);
    await textarea.fill(lines.join('\n'));

    // 捲動到中間位置
    await textarea.evaluate(el => {
      el.scrollTop = el.scrollHeight / 2;
    });

    // 等待捲動同步
    await page.waitForTimeout(100);

    // 檢查行號區域也應該同步捲動
    const lineNumbers = page.getByTestId('line-numbers');
    const lineNumbersScrollTop = await lineNumbers.evaluate(el => el.scrollTop);
    const textareaScrollTop = await textarea.evaluate(el => el.scrollTop);

    expect(Math.abs(lineNumbersScrollTop - textareaScrollTop)).toBeLessThan(5);
  });

  test('應該保持與原有工具列功能的相容性', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 輸入測試內容
    await textarea.fill('test content');

    // 選取部分文字
    await textarea.selectText();
    await page.keyboard.press('Home');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Shift+ArrowRight');
    }

    // 點擊粗體按鈕
    await page.getByTestId('toolbar-bold').click();

    // 檢查格式化是否正常工作
    const content = await textarea.inputValue();
    expect(content).toBe('**test** content');
  });

  test('應該支援鍵盤快捷鍵', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 輸入並選取文字
    await textarea.fill('test');
    await textarea.selectText();

    // 使用 Ctrl+B 快捷鍵
    await page.keyboard.press('Control+b');

    // 檢查快捷鍵是否正常工作
    const content = await textarea.inputValue();
    expect(content).toBe('**test**');
  });

  test('應該正確處理中文輸入', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 清空編輯器內容，然後填入測試內容
    await textarea.selectText();
    await textarea.fill('測試中文輸入');

    // 檢查內容是否正確
    const content = await textarea.inputValue();
    expect(content).toBe('測試中文輸入');

    // 檢查行號是否正確顯示
    const lineNumbers = page.getByTestId('line-numbers');
    await expect(lineNumbers).toContainText('1');
  });

  test('應該處理大量文字內容', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 生成大量內容
    const largeContent = Array.from(
      { length: 100 },
      (_, i) =>
        `# 標題 ${i + 1}\n\n這是第 ${i + 1} 段的內容。包含一些 **粗體** 和 *斜體* 文字。\n\n\`\`\`javascript\nconsole.log('代碼塊 ${i + 1}');\n\`\`\`\n`
    ).join('\n');

    await textarea.fill(largeContent);

    // 檢查內容是否正確載入
    const content = await textarea.inputValue();
    expect(content.length).toBeGreaterThan(1000);

    // 檢查行號是否正確顯示
    const lineNumbers = page.getByTestId('line-numbers');
    await expect(lineNumbers).toContainText('100');
  });

  test('語法高亮應該不影響選取和編輯功能', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 輸入包含各種 Markdown 語法的內容
    const markdownContent = `# 主標題

## 副標題

這是一段包含 **粗體** 和 *斜體* 的文字。

- 清單項目 1
- 清單項目 2

\`\`\`javascript
console.log('Hello World');
\`\`\`

[連結文字](https://example.com)`;

    await textarea.fill(markdownContent);

    // 選取部分文字並替換
    await textarea.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Home');

    // 選取第一行標題
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Shift+ArrowRight');
    }

    // 替換選取的文字
    await page.keyboard.type('新標題');

    // 檢查替換是否成功
    const content = await textarea.inputValue();
    expect(content).toContain('新標題');
  });

  test('應該在手機尺寸下正常顯示', async ({ page }) => {
    // 設定手機螢幕尺寸
    await page.setViewportSize({ width: 375, height: 667 });

    // 編輯器應該仍然可見且功能正常
    await expect(page.getByTestId('markdown-editor')).toBeVisible();
    await expect(page.getByTestId('line-numbers')).toBeVisible();
    await expect(page.getByTestId('editor-textarea')).toBeVisible();

    // 測試基本編輯功能
    const textarea = page.getByTestId('editor-textarea');
    await textarea.fill('手機測試\n第二行');

    const content = await textarea.inputValue();
    expect(content).toBe('手機測試\n第二行');
  });

  test('應該保持游標位置在格式化後', async ({ page }) => {
    const textarea = page.getByTestId('editor-textarea');

    // 清空編輯器內容，然後填入測試內容
    await textarea.selectText();
    await textarea.fill('這是測試內容');
    await textarea.click();
    await page.keyboard.press('Home');
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowRight');
    }

    // 選取兩個字
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Shift+ArrowRight');
    }

    // 應用粗體格式
    await page.getByTestId('toolbar-bold').click();

    // 檢查格式化結果
    const content = await textarea.inputValue();
    expect(content).toBe('這**是**測試內容');

    // 檢查游標位置（應該在格式化後的文字中）
    const selectionStart = await textarea.evaluate(
      (el: HTMLTextAreaElement) => el.selectionStart
    );
    expect(selectionStart).toBe(4); // 在 "是" 字後面
  });
});
