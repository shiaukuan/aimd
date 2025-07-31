# Next.js 15 測試環境配置完整教學

## 前言

本文將帶你從零開始配置一個完整的 Next.js 15 專案測試環境，包含單元測試和端對端（E2E）測試。適合網路開發新手學習。

## 目錄

1. [測試基礎概念](#測試基礎概念)
2. [專案準備](#專案準備)
3. [單元測試配置 (Vitest)](#單元測試配置-vitest)
4. [E2E 測試配置 (Playwright)](#e2e-測試配置-playwright)
5. [測試檔案結構](#測試檔案結構)
6. [執行測試](#執行測試)
7. [測試覆蓋率](#測試覆蓋率)
8. [常見問題](#常見問題)

## 測試基礎概念

### 什麼是測試？

軟體測試是驗證程式碼是否按預期工作的過程。主要有三種測試類型：

- **單元測試 (Unit Test)**: 測試個別函數或元件
- **整合測試 (Integration Test)**: 測試多個元件間的互動
- **E2E 測試 (End-to-End Test)**: 測試完整的使用者流程

### 為什麼需要測試？

1. **品質保證**: 確保程式碼正確運行
2. **重構安全**: 修改程式碼時不怕破壞既有功能
3. **文檔作用**: 測試程式碼本身就是最好的使用範例
4. **團隊協作**: 讓其他開發者了解程式碼的預期行為

## 專案準備

確保你的專案已經初始化並安裝了基礎依賴：

```bash
# 檢查 Node.js 版本 (需要 20 LTS 或以上)
node --version

# 檢查 pnpm
pnpm --version

# 專案結構應該類似：
your-project/
├── src/
├── package.json
├── next.config.js
└── tsconfig.json
```

## 單元測試配置 (Vitest)

### 為什麼選擇 Vitest？

- 🚀 **速度快**: 比 Jest 快 10-20 倍
- 🔧 **零配置**: 內建 TypeScript 支援
- ⚡ **熱重載**: 支援檔案變更時自動重新執行
- 🎯 **現代化**: 支援 ES modules 和 Vite 生態

### 1. 安裝 Vitest 相關套件

```bash
pnpm add -D vitest@^3.2.4 @vitejs/plugin-react@^4.7.0 jsdom@^26.1.0 @testing-library/react@^16.3.0 @testing-library/jest-dom@^6.6.4 @testing-library/user-event@^14.6.1 @vitest/coverage-v8@^3.2.4
```

**套件說明：**

- `vitest`: 測試框架本體
- `@vitejs/plugin-react`: React 支援
- `jsdom`: 模擬瀏覽器環境
- `@testing-library/react`: React 元件測試工具
- `@testing-library/jest-dom`: 額外的斷言方法

### 2. 建立 Vitest 配置檔

建立 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. 建立測試設定檔

建立 `src/test/setup.ts`：

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 每個測試後清理
afterEach(() => {
  cleanup();
});

// 模擬瀏覽器 API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模擬 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模擬 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### 4. 撰寫第一個單元測試

以 `src/lib/utils.test.ts` 為例：

```typescript
// ABOUTME: Unit tests for utility functions using Vitest and colocation pattern
// ABOUTME: Tests the cn function for className merging functionality

import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });

  it('should remove duplicate classes', () => {
    const result = cn('duplicate', 'duplicate', 'unique');
    expect(result).toBe('duplicate unique');
  });
});
```

## E2E 測試配置 (Playwright)

### 為什麼選擇 Playwright？

- 🌐 **多瀏覽器**: 支援 Chrome、Firefox、Safari、Edge
- 📱 **行動裝置**: 模擬手機和平板測試
- 🔧 **強大 API**: 豐富的互動和斷言方法
- ⚡ **速度快**: 並行執行測試

### 1. 安裝 Playwright

```bash
pnpm add -D @playwright/test@^1.54.1
pnpm playwright install
```

### 2. 建立 Playwright 配置檔

建立 `playwright.config.ts`：

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // // 行動裝置測試
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. 撰寫第一個 E2E 測試

建立 `tests/e2e/basic.spec.ts`：

```typescript
// ABOUTME: Basic E2E tests for the markdown slides application using Playwright
// ABOUTME: Tests fundamental app functionality like page loading, navigation, and basic interactions

import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');

    // 檢查頁面標題
    await expect(page).toHaveTitle(/Markdown 投影片產生器/);

    // 檢查基本頁面結構
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // 設定行動裝置視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 檢查頁面在行動裝置上正常顯示
    await expect(page.locator('body')).toBeVisible();

    // 驗證沒有水平滾動條
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
```

## 測試檔案結構

我們採用 **Colocation 測試架構**，將測試檔案放在對應的原始檔旁邊：

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx          # 元件測試
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts               # 工具函數測試
│   ├── validations.ts
│   └── validations.test.ts         # 驗證邏輯測試
└── test/
    └── setup.ts                    # 測試設定檔

tests/
└── e2e/
    ├── basic.spec.ts              # 基礎功能測試
    └── slide-editor.spec.ts       # 編輯器功能測試
```

### Colocation 測試的優點

1. **就近原則**: 測試檔案與原始檔在同一位置
2. **易於維護**: 修改程式碼時容易找到對應測試
3. **模組化**: 每個功能模組都有自己的測試

## 執行測試

### 更新 package.json 腳本

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### 測試指令說明

```bash
# 執行所有單元測試（單次執行）
pnpm test

# 監視模式（檔案變更時自動執行）
pnpm test:watch

# 執行測試並生成覆蓋率報告
pnpm test:coverage

# 執行 E2E 測試
pnpm test:e2e

# 有頭模式執行 E2E 測試（可以看到瀏覽器）
pnpm test:e2e:headed
```

## 測試覆蓋率

### 理解覆蓋率指標

- **Statements (語句覆蓋率)**: 執行過的程式碼行數比例
- **Branches (分支覆蓋率)**: 執行過的條件分支比例
- **Functions (函式覆蓋率)**: 執行過的函式比例
- **Lines (行覆蓋率)**: 執行過的程式碼行比例

### 覆蓋率報告範例

```
-----------------|---------|----------|---------|---------|
File             | % Stmts | % Branch | % Funcs | % Lines |
-----------------|---------|----------|---------|---------|
All files        |   43.36 |    91.66 |    87.5 |   43.36 |
 lib             |     100 |      100 |     100 |     100 |
  utils.ts       |     100 |      100 |     100 |     100 |
  validations.ts |     100 |      100 |     100 |     100 |
 components/ui   |   53.19 |      100 |     100 |   53.19 |
  button.tsx     |     100 |      100 |     100 |     100 |
-----------------|---------|----------|---------|---------|
```

### 提升覆蓋率的策略

1. **優先測試核心邏輯**: 業務邏輯和工具函數
2. **測試邊界條件**: 極值、空值、錯誤情況
3. **測試使用者互動**: 點擊、輸入、表單提交
4. **避免過度測試**: 不需要測試第三方函式庫

## 常見問題

### Q1: 測試執行很慢怎麼辦？

**A**:

- 使用 `pnpm test:watch` 只執行變更的測試
- 避免在測試中使用 `setTimeout`
- 使用 `vi.mock()` 模擬耗時操作

### Q2: E2E 測試失敗怎麼辦？

**A**:

- 檢查 `http://localhost:3000` 是否可訪問
- 使用 `--headed` 模式觀察瀏覽器行為
- 檢查測試中的選擇器是否正確

### Q3: TypeScript 類型錯誤怎麼辦？

**A**:

- 確保安裝了 `@types/` 相關套件
- 檢查 `tsconfig.json` 配置
- 使用 `vi.mock()` 時添加正確的類型

### Q4: 測試中如何處理非同步操作？

**A**:

```typescript
// 使用 async/await
test('async operation', async () => {
  const result = await someAsyncFunction();
  expect(result).toBe('expected');
});

// 等待元素出現
test('wait for element', async ({ page }) => {
  await page.waitForSelector('[data-testid="loading"]');
  await expect(page.locator('[data-testid="content"]')).toBeVisible();
});
```

### Q5: 如何測試私有方法？

**A**:

- **不要直接測試私有方法**，透過公開 API 間接測試
- 如果私有方法很複雜，考慮提取為獨立的公開函數
- 重點測試行為而不是實現細節

## 進階主題

### 測試驅動開發 (TDD)

TDD 的三個步驟：

1. **Red**: 先寫失敗的測試
2. **Green**: 寫最少的程式碼讓測試通過
3. **Refactor**: 重構程式碼但保持測試通過

```typescript
// 1. Red - 先寫測試
test('should calculate tax', () => {
  expect(calculateTax(100, 0.1)).toBe(10);
});

// 2. Green - 實現功能
function calculateTax(amount: number, rate: number) {
  return amount * rate;
}

// 3. Refactor - 改善程式碼
function calculateTax(amount: number, rate: number) {
  if (amount < 0 || rate < 0) {
    throw new Error('Amount and rate must be positive');
  }
  return Math.round(amount * rate * 100) / 100;
}
```

### Mock 和 Stub

```typescript
// Mock 整個模組
vi.mock('./api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'mocked' })),
}));

// Mock 特定函數
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked result');
mockFn.mockResolvedValue('async result');
```

### 測試環境隔離

```typescript
// 使用 beforeEach 和 afterEach 確保測試隔離
describe('User service', () => {
  beforeEach(() => {
    // 每個測試前的設定
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 每個測試後的清理
    cleanup();
  });
});
```

## 結語

恭喜你完成了 Next.js 15 測試環境的配置！現在你有了：

- ✅ 完整的單元測試環境 (Vitest)
- ✅ 強大的 E2E 測試環境 (Playwright)
- ✅ 測試覆蓋率報告
- ✅ Colocation 測試架構
- ✅ TypeScript 支援

記住，測試不是負擔，而是讓你更有信心開發的工具。從小功能開始練習，逐漸養成先寫測試的習慣，你會發現程式碼品質和開發效率都會大幅提升！

## 延伸學習

- [Vitest 官方文檔](https://vitest.dev/)
- [Playwright 官方文檔](https://playwright.dev/)
- [Testing Library 官方文檔](https://testing-library.com/)
- [TDD 實踐指南](https://testdrivendevelopment.io/)

---

_📅 文件更新日期：2025年7月_  
_🤖 此教學文件提供完整的測試環境設定指導_  
_🔄 已更新至最新版本的測試套件和配置_
