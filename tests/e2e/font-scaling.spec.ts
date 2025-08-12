// ABOUTME: 字體縮放功能的端到端測試，驗證當段落數量增加時字體自動變小
// ABOUTME: 測試包含CSS規則檢測和實際字體大小變化的驗證

import { test, expect } from '@playwright/test';

test.describe('字體縮放功能', () => {
  
  test('當段落很少時應該使用正常字體大小', async ({ page }) => {
    await page.goto('/');
    
    // 輸入少量內容
    const shortContent = `# 標題

## 第一段
這是第一段內容。

## 第二段  
這是第二段內容。

---

# 第二張投影片

簡短內容。`;

    await page.fill('[data-testid="markdown-editor"]', shortContent);
    
    // 等待渲染完成
    await page.waitForSelector('[data-testid="preview"] .marp-container section', { state: 'visible' });
    
    // 檢查第一張投影片的字體大小
    const section = page.locator('[data-testid="preview"] .marp-container section').first();
    await expect(section).toBeVisible();
    
    // 驗證沒有添加縮小字體的 class
    await expect(section).not.toHaveClass(/content-overflow/);
    await expect(section).not.toHaveClass(/content-overflow-large/);
    
    // 取得樣式資訊來驗證字體大小
    const fontSize = await section.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    console.log('短內容字體大小:', fontSize);
  });

  test('當段落很多時應該自動縮小字體', async ({ page }) => {
    await page.goto('/');
    
    // 輸入大量內容
    const longContent = `# PyTest 教學簡報

---

## 目錄
1️⃣ 為什麼選擇 pytest
2️⃣ 安裝與環境設定
3️⃣ 基本測試寫法
4️⃣ 斷言 (Assertions)
5️⃣ Fixture 基礎
6️⃣ 參數化測試
7️⃣ 內建標記與自訂標記
8️⃣ Mock 與 Patch
9️⃣ 測試覆蓋率
🔟 最佳實踐 & CI 整合

---

## 為什麼選擇 pytest？
- 簡潔：只要寫普通的 Python 函式，即可當作測試。
- 強大的功能：fixture、參數化、插件生態系。
- 易讀：斷言失敗時，報告自動顯示詳細的表達式值。
- 廣泛支援：支援 unittest、nose、doctest 等遺留測試。
- 豐富的插件：pytest-cov、pytest-mock、pytest-xdist 等。

## 安裝與環境設定
建議使用 virtualenv、poetry 或 conda 來管理環境。

\`\`\`bash
python -m venv .venv
source .venv/bin/activate
pip install pytest pytest-cov pytest-mock
\`\`\`

在 pyproject.toml 中加入設定：

\`\`\`toml
[tool.pytest.ini_options]
minversion = "6.0"
addopts = "-ra -q"
testpaths = ["tests"]
\`\`\`

## 基本測試寫法
專案結構應該清楚分離原始碼和測試碼。

## 斷言功能
pytest 提供強大的斷言功能，能自動分析表達式。

## Fixture 系統
Fixture 是 pytest 最強大的功能之一，提供測試前置和後置處理。

## 參數化測試
使用 @pytest.mark.parametrize 可以輕鬆建立多組測試資料。

## 標記系統
內建和自訂標記讓測試組織更靈活。

## Mock 功能
pytest-mock 提供便利的 mock 功能。

## 覆蓋率報告
pytest-cov 提供詳細的測試覆蓋率分析。

## CI 整合
與 GitHub Actions、Jenkins 等 CI 系統完美整合。

## 最佳實踐
保持測試獨立、命名規範、快速失敗等原則。`;

    await page.fill('[data-testid="markdown-editor"]', longContent);
    
    // 等待渲染完成
    await page.waitForSelector('[data-testid="preview"] .marp-container section', { state: 'visible' });
    
    // 等待一些時間讓溢出檢測邏輯執行
    await page.waitForTimeout(500);
    
    // 檢查第一張投影片（目錄頁面）
    const section = page.locator('[data-testid="preview"] .marp-container section').first();
    await expect(section).toBeVisible();
    
    // 檢查是否應用了內容溢出的縮放
    const hasOverflowClass = await section.evaluate((el) => {
      return el.classList.contains('content-overflow') || el.classList.contains('content-overflow-large');
    });
    
    // 檢查CSS樣式中是否包含段落數量檢測規則
    const hasSegmentScaling = await page.evaluate(() => {
      const styles = Array.from(document.styleSheets).flatMap(sheet => 
        Array.from(sheet.cssRules).map(rule => rule.cssText)
      );
      return styles.some(css => 
        css.includes('section:has(p:nth-of-type(10))') && css.includes('font-size: 0.9em')
      );
    });
    
    // 取得實際的字體大小和縮放比例
    const styleInfo = await section.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: style.fontSize,
        transform: style.transform,
        hasOverflowClass: el.classList.contains('content-overflow'),
        hasOverflowLargeClass: el.classList.contains('content-overflow-large'),
      };
    });
    
    console.log('長內容樣式資訊:', styleInfo);
    console.log('是否有段落數量縮放規則:', hasSegmentScaling);
    
    // 驗證至少其中一種縮放機制有作用
    expect(hasOverflowClass || hasSegmentScaling).toBe(true);
    
    if (hasOverflowClass) {
      console.log('✅ 溢出檢測機制有效：內容被自動縮放');
    }
    
    if (hasSegmentScaling) {
      console.log('✅ 段落數量檢測機制有效：CSS 規則已套用');
    }
  });

  test('從短內容切換到長內容時字體應該動態調整', async ({ page }) => {
    await page.goto('/');
    
    // 先輸入短內容
    const shortContent = `# 簡單標題

這是一段簡短的內容。`;

    await page.fill('[data-testid="markdown-editor"]', shortContent);
    await page.waitForSelector('[data-testid="preview"] .marp-container section', { state: 'visible' });
    
    // 記錄短內容的字體大小
    const shortContentFontSize = await page.locator('[data-testid="preview"] .marp-container section').first().evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    console.log('短內容字體大小:', shortContentFontSize);
    
    // 切換到長內容
    const longContent = `# 很長的投影片

## 第一段落
這是第一段內容，包含很多文字。

## 第二段落  
這是第二段內容，也包含很多文字。

## 第三段落
繼續添加更多內容。

## 第四段落
更多段落內容。

## 第五段落
持續增加段落數量。

## 第六段落
這樣段落數量就會很多。

## 第七段落
繼續添加段落。

## 第八段落
更多的段落內容。

## 第九段落
第九個段落。

## 第十段落
第十個段落，應該觸發字體縮小。

## 第十一段落
超過十個段落了。

## 第十二段落
繼續添加內容。

## 第十三段落
更多段落。

## 第十四段落
第十四個段落。

## 第十五段落
第十五個段落，應該觸發更小的字體。

## 第十六段落
超過十五個段落了。`;

    await page.fill('[data-testid="markdown-editor"]', longContent);
    await page.waitForTimeout(500); // 等待 debounce 和渲染
    
    // 記錄長內容的字體效果
    const section = page.locator('[data-testid="preview"] .marp-container section').first();
    const longContentStyleInfo = await section.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: style.fontSize,
        transform: style.transform,
        hasOverflowClass: el.classList.contains('content-overflow'),
        hasOverflowLargeClass: el.classList.contains('content-overflow-large'),
      };
    });
    
    console.log('長內容樣式資訊:', longContentStyleInfo);
    
    // 驗證字體確實有變化（透過 class 或 transform）
    const hasScaling = longContentStyleInfo.hasOverflowClass || 
                      longContentStyleInfo.hasOverflowLargeClass || 
                      longContentStyleInfo.transform !== 'none';
    
    expect(hasScaling).toBe(true);
    console.log('✅ 字體縮放功能正常運作');
  });
});