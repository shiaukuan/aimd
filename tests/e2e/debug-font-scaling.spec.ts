// ABOUTME: 調試字體縮放功能的測試，檢查實際運行的字體縮放行為
// ABOUTME: 包含詳細的日誌輸出來診斷問題

import { test, expect } from '@playwright/test';

test('調試字體縮放功能', async ({ page }) => {
  // 導航到頁面（使用正確的端口）
  await page.goto('http://localhost:3001/');
  
  // 輸入測試內容（簡化版）
  const testContent = `# 測試多段落內容
段落1：這是第一個段落
段落2：這是第二個段落
段落3：這是第三個段落
段落4：這是第四個段落
段落5：這是第五個段落，應該觸發字體縮小
段落6：這是第六個段落
段落7：這是第七個段落
段落8：這是第八個段落，應該觸發更小字體
段落9：這是第九個段落
段落10：這是第十個段落`;

  // 找到 textarea 編輯器並輸入內容
  await page.fill('[data-testid="markdown-editor"] textarea', testContent);
  
  // 等待渲染完成
  await page.waitForSelector('[data-testid="preview"] .marp-container section', { state: 'visible' });
  
  // 等待字體縮放邏輯執行
  await page.waitForTimeout(1000);
  
  // 取得投影片元素
  const section = page.locator('[data-testid="preview"] .marp-container section').first();
  
  // 詳細檢查
  const debugInfo = await section.evaluate((el) => {
    // 檢查段落數量
    const paragraphs = el.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    console.log('找到的段落元素:', paragraphs.length);
    
    // 檢查 class
    const classes = Array.from(el.classList);
    console.log('投影片 class:', classes);
    
    // 檢查樣式
    const style = window.getComputedStyle(el);
    
    return {
      paragraphCount: paragraphs.length,
      classList: classes,
      fontSize: style.fontSize,
      transform: style.transform,
      hasManyParagraphs: el.classList.contains('many-paragraphs'),
      hasVeryManyParagraphs: el.classList.contains('very-many-paragraphs'),
      hasContentOverflow: el.classList.contains('content-overflow'),
      hasContentOverflowLarge: el.classList.contains('content-overflow-large'),
    };
  });
  
  console.log('調試資訊:', debugInfo);
  
  // 檢查是否有段落縮放 class（使用新的閾值）
  if (debugInfo.paragraphCount >= 8) {
    expect(debugInfo.hasVeryManyParagraphs, 
      `應該有 very-many-paragraphs class，但只找到: ${debugInfo.classList.join(', ')}`
    ).toBe(true);
  } else if (debugInfo.paragraphCount >= 5) {
    expect(debugInfo.hasManyParagraphs,
      `應該有 many-paragraphs class，但只找到: ${debugInfo.classList.join(', ')}`  
    ).toBe(true);
  }
  
  // 檢查 CSS 樣式是否正確套用
  const cssRules = await page.evaluate(() => {
    const styles = Array.from(document.styleSheets).flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText);
      } catch (e) {
        return [];
      }
    });
    return styles.filter(css => 
      css.includes('many-paragraphs') || css.includes('very-many-paragraphs')
    );
  });
  
  console.log('相關的 CSS 規則:', cssRules);
  
  expect(cssRules.length).toBeGreaterThan(0);
});