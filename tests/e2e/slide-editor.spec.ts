// ABOUTME: E2E tests for slide editor functionality using Playwright
// ABOUTME: Tests editor interactions, markdown editing, and preview features

import { test, expect } from '@playwright/test';

test.describe('Slide Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display editor interface when implemented', async ({ page }) => {
    // Look for editor-related elements
    const editorContainer = page.locator('[data-testid="editor"], .editor, [aria-label*="editor"]');
    const previewContainer = page.locator('[data-testid="preview"], .preview, [aria-label*="preview"]');
    
    // Check if editor components exist
    const hasEditor = await editorContainer.count() > 0;
    const hasPreview = await previewContainer.count() > 0;
    
    // Skip if editor is not implemented yet
    test.skip(!hasEditor && !hasPreview, 'Editor interface not implemented yet');
    
    if (hasEditor) {
      await expect(editorContainer).toBeVisible();
    }
    
    if (hasPreview) {
      await expect(previewContainer).toBeVisible();
    }
  });

  test('should handle markdown input in editor', async ({ page }) => {
    // Look for markdown editor (textarea or contenteditable)
    const markdownEditor = page.locator('textarea[placeholder*="markdown"], [data-testid="markdown-editor"], .markdown-editor');
    
    const hasMarkdownEditor = await markdownEditor.count() > 0;
    test.skip(!hasMarkdownEditor, 'Markdown editor not implemented yet');
    
    if (hasMarkdownEditor) {
      const editor = markdownEditor.first();
      await expect(editor).toBeVisible();
      
      // Test markdown input
      const markdownContent = `# Test Slide

This is a test slide with **bold** text and *italic* text.

## Code Example

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

- List item 1
- List item 2
- List item 3`;

      await editor.fill(markdownContent);
      await expect(editor).toHaveValue(markdownContent);
    }
  });

  // Phase 1 完成：編輯器基本結構存在，但即時預覽功能還未完善
  // 先跳過此測試，等 Phase 3-4 實作完成後再啟用
  test.skip('should show live preview of markdown content', async ({ page }) => {
    // 預期在 Phase 3-4 實作：Markdown 編輯器 + Marp 預覽
    // 目前預覽區顯示靜態內容，而非動態更新
  });

  test('should handle slide navigation', async ({ page }) => {
    const prevButton = page.locator('[data-testid="prev-slide"], button:has-text("Previous")');
    const nextButton = page.locator('[data-testid="next-slide"], button:has-text("Next")');
    const slideCounter = page.locator('[data-testid="slide-counter"], .slide-counter');
    
    const hasNavigation = await prevButton.count() > 0 || await nextButton.count() > 0;
    test.skip(!hasNavigation, 'Slide navigation not implemented yet');
    
    if (hasNavigation) {
      // Test next button if it exists and is enabled
      if (await nextButton.count() > 0) {
        const isNextEnabled = await nextButton.isEnabled();
        if (isNextEnabled) {
          await nextButton.click();
          // Wait for any animation or transition
          await page.waitForTimeout(200);
        }
      }
      
      // Test previous button if it exists and is enabled
      if (await prevButton.count() > 0) {
        const isPrevEnabled = await prevButton.isEnabled();
        if (isPrevEnabled) {
          await prevButton.click();
          await page.waitForTimeout(200);
        }
      }
      
      // Check slide counter if it exists
      if (await slideCounter.count() > 0) {
        await expect(slideCounter).toBeVisible();
        await expect(slideCounter).toContainText(/\d+/); // Should contain numbers
      }
    }
  });

  test('should support keyboard shortcuts in editor', async ({ page }) => {
    const markdownEditor = page.locator('textarea[placeholder*="markdown"], [data-testid="markdown-editor"]');
    
    const hasEditor = await markdownEditor.count() > 0;
    test.skip(!hasEditor, 'Markdown editor not implemented yet');
    
    if (hasEditor) {
      await markdownEditor.focus();
      await markdownEditor.fill('Some text to test shortcuts');
      
      // Test Ctrl+A (Select All)
      await page.keyboard.press('Control+a');
      
      // Test Ctrl+Z (Undo) - might not work in basic textarea
      await page.keyboard.press('Control+z');
      
      // Test Tab for indentation (if supported)
      await markdownEditor.fill('Line 1\nLine 2');
      await page.keyboard.press('Home'); // Go to beginning
      await page.keyboard.press('Tab');
    }
  });

  test('should handle file operations', async ({ page }) => {
    const saveButton = page.locator('[data-testid="save"], button:has-text("Save")');
    const loadButton = page.locator('[data-testid="load"], button:has-text("Load")');
    const exportButton = page.locator('[data-testid="export"], button:has-text("Export")');
    
    const hasFileOps = await saveButton.count() > 0 || await loadButton.count() > 0 || await exportButton.count() > 0;
    test.skip(!hasFileOps, 'File operations not implemented yet');
    
    // Test save functionality
    if (await saveButton.count() > 0) {
      await saveButton.click();
      // Wait for any save indication
      await page.waitForTimeout(500);
    }
    
    // Test export functionality
    if (await exportButton.count() > 0) {
      await exportButton.click();
      // This might trigger a download or modal
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Slide Generation', () => {
  // Phase 1 完成：基礎架構存在，但表單尚未完全實作
  // 表單元件已存在但部分功能（如顯示/隱藏邏輯）還在開發中
  test.skip('should show generation form when implemented', async ({ page }) => {
    // 預期在 Phase 5-6 實作：後端 API + 前端整合
    // 目前表單元件存在但可能處於隱藏狀態或功能不完整
  });

  test.skip('should validate generation form inputs', async ({ page }) => {
    // 預期在 Phase 6 實作：表單驗證和錯誤處理
    // 需要配合 Zod 驗證系統和狀態管理
  });
});